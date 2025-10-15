import { geminiService } from './gemini';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

export class FileParserService {
  async parseFile(file: File): Promise<Transaction[]> {
    try {
      // Try to read the file with proper encoding handling
      let text: string;
      
      try {
        // First try UTF-8
        text = await file.text();
      } catch (error) {
        // Fallback: read as array buffer and decode manually
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        text = decoder.decode(buffer);
      }
      
      // Clean up common encoding issues at the file level
      text = text
        .replace(/\uFEFF/g, '') // Remove BOM
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n');  // Handle old Mac line endings
      
      let transactions: Transaction[] = [];

      // Determine file type and parse accordingly
      if (file.name.toLowerCase().endsWith('.csv')) {
        transactions = await this.parseCSV(text);
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        transactions = await this.parseText(text);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        transactions = await this.parseJSON(text);
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        // For Excel files, we'll treat them as CSV for now
        transactions = await this.parseCSV(text);
      } else {
        // Try to auto-detect format
        transactions = await this.autoDetectAndParse(text);
      }

      // Use AI to improve categorization
      transactions = await this.enhanceWithAI(transactions);

      return transactions;
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error('Failed to parse file. Please check the format and try again.');
    }
  }

  private async parseCSV(text: string): Promise<Transaction[]> {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const transactions: Transaction[] = [];
    
    // Try to detect header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('date') || firstLine.includes('description') || firstLine.includes('amount');
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const transaction = await this.parseCSVLine(line, i);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private async parseCSVLine(line: string, index: number): Promise<Transaction | null> {
    // Handle different CSV formats and delimiters
    const delimiters = [',', ';', '\t', '|'];
    let columns: string[] = [];
    
    for (const delimiter of delimiters) {
      // Better CSV parsing that handles quoted fields and special characters
      const testColumns = this.parseCSVColumns(line, delimiter);
      if (testColumns.length >= 3) {
        columns = testColumns;
        break;
      }
    }

    if (columns.length < 3) return null;

    // Try different column arrangements
    const arrangements = [
      // [date, description, amount, category, type]
      { date: 0, description: 1, amount: 2, category: 3, type: 4 },
      // [description, amount, date]
      { description: 0, amount: 1, date: 2, category: -1, type: -1 },
      // [date, amount, description]
      { date: 0, amount: 1, description: 2, category: -1, type: -1 },
      // [amount, description, date]
      { amount: 0, description: 1, date: 2, category: -1, type: -1 },
    ];

    for (const arrangement of arrangements) {
      try {
        const transaction = this.extractTransactionFromColumns(columns, arrangement, index);
        if (transaction) return transaction;
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  private parseCSVColumns(line: string, delimiter: string): string[] {
    const columns: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }

      if (!inQuotes && char === delimiter) {
        // End of column
        columns.push(this.cleanColumnValue(current));
        current = '';
        i++;
        continue;
      }

      current += char;
      i++;
    }

    // Add the last column
    columns.push(this.cleanColumnValue(current));
    return columns;
  }

  private cleanColumnValue(value: string): string {
    // Remove surrounding quotes and clean up the value
    let cleaned = value.trim();
    
    // Remove surrounding quotes
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Handle escaped quotes
    cleaned = cleaned.replace(/""/g, '"');
    
    // Clean up common encoding issues and symbols
    cleaned = cleaned
      .replace(/â‚¹/g, '₹') // Fix rupee symbol encoding
      .replace(/â€"/g, '–') // Fix dash encoding
      .replace(/â€™/g, "'") // Fix apostrophe encoding
      .replace(/â€œ/g, '"') // Fix left quote
      .replace(/â€/g, '"')  // Fix right quote
      .replace(/Ã¢â‚¬â„¢/g, "'") // Another apostrophe encoding
      .replace(/Ã¢â‚¬Å"/g, '"') // Another quote encoding
      .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();
    
    return cleaned;
  }

  private extractTransactionFromColumns(columns: string[], arrangement: any, index: number): Transaction | null {
    try {
      // Extract amount
      const amountStr = columns[arrangement.amount] || '';
      const amount = this.parseAmount(amountStr);
      if (isNaN(amount) || amount === 0) return null;

      // Extract description
      const description = columns[arrangement.description] || `Transaction ${index + 1}`;
      if (!description.trim()) return null;

      // Extract date
      let date = new Date().toISOString().split('T')[0];
      if (arrangement.date >= 0 && columns[arrangement.date]) {
        const parsedDate = this.parseDate(columns[arrangement.date]);
        if (parsedDate) date = parsedDate;
      }

      // Extract category and type
      let category = 'Others / Miscellaneous';
      let type: 'income' | 'expense' = amount > 0 ? 'income' : 'expense';

      if (arrangement.category >= 0 && columns[arrangement.category]) {
        category = columns[arrangement.category];
      }

      if (arrangement.type >= 0 && columns[arrangement.type]) {
        const typeStr = columns[arrangement.type].toLowerCase();
        if (typeStr.includes('income') || typeStr.includes('credit')) {
          type = 'income';
        } else if (typeStr.includes('expense') || typeStr.includes('debit')) {
          type = 'expense';
        }
      }

      return {
        id: Date.now() + index,
        description: description.trim(),
        amount: Math.abs(amount),
        category,
        date,
        type
      };
    } catch (error) {
      return null;
    }
  }

  private parseAmount(amountStr: string): number {
    // Remove currency symbols and spaces
    const cleaned = amountStr.replace(/[₹$€£¥,\s]/g, '');
    
    // Handle negative amounts (expenses)
    const isNegative = cleaned.includes('-') || cleaned.includes('(') || cleaned.includes('Dr');
    
    // Extract numeric value
    const numericStr = cleaned.replace(/[^\d.]/g, '');
    const amount = parseFloat(numericStr);
    
    return isNegative ? -Math.abs(amount) : amount;
  }

  private parseDate(dateStr: string): string | null {
    try {
      // Try different date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY or DD/MM/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY or DD-MM-YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
      ];

      for (const format of formats) {
        if (format.test(dateStr)) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }

      // Try parsing as-is
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async parseText(text: string): Promise<Transaction[]> {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: Transaction[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try to extract amount and description from text
      const amountMatch = line.match(/₹?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const description = line.replace(amountMatch[0], '').trim() || `Transaction ${i + 1}`;

        transactions.push({
          id: Date.now() + i,
          description,
          amount,
          category: 'Others / Miscellaneous',
          date: new Date().toISOString().split('T')[0],
          type: 'expense'
        });
      }
    }

    return transactions;
  }

  private async parseJSON(text: string): Promise<Transaction[]> {
    try {
      const data = JSON.parse(text);
      const transactions: Transaction[] = [];

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (typeof item === 'object' && item.amount) {
            transactions.push({
              id: Date.now() + i,
              description: item.description || item.desc || `Transaction ${i + 1}`,
              amount: Math.abs(parseFloat(item.amount)),
              category: item.category || 'Others / Miscellaneous',
              date: item.date || new Date().toISOString().split('T')[0],
              type: item.type || (parseFloat(item.amount) < 0 ? 'expense' : 'income')
            });
          }
        }
      }

      return transactions;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  private async autoDetectAndParse(text: string): Promise<Transaction[]> {
    // Try CSV first
    if (text.includes(',') || text.includes(';')) {
      try {
        return await this.parseCSV(text);
      } catch (error) {
        // Continue to next format
      }
    }

    // Try JSON
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
      try {
        return await this.parseJSON(text);
      } catch (error) {
        // Continue to next format
      }
    }

    // Fallback to text parsing
    return await this.parseText(text);
  }

  private async enhanceWithAI(transactions: Transaction[]): Promise<Transaction[]> {
    // Use AI to improve categorization for transactions without proper categories
    const enhancedTransactions = [...transactions];

    for (let i = 0; i < enhancedTransactions.length; i++) {
      const transaction = enhancedTransactions[i];
      
      // Only enhance if category is generic
      if (transaction.category === 'Others / Miscellaneous' || !transaction.category) {
        try {
          const aiCategory = await geminiService.categorizeExpense(transaction.description, transaction.amount);
          if (aiCategory && aiCategory !== 'Others') {
            enhancedTransactions[i] = {
              ...transaction,
              category: aiCategory
            };
          }
        } catch (error) {
          // Keep original category if AI fails
          console.warn('AI categorization failed for:', transaction.description);
        }
      }
    }

    return enhancedTransactions;
  }
}

export const fileParserService = new FileParserService();
