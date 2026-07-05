import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, PlusCircle, TrendingDown, TrendingUp, Wallet, Trash2, Upload, FileText, BarChart3, PieChart, Target, Bell, BellRing, AlertTriangle, TrendingDown as TrendingDownIcon, DollarSign, Lightbulb, MessageCircle, Bot, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { transactionService } from "../services/transaction.service";
import { budgetService } from "../services/budget.service";
import { goalService } from "../services/goal.service";
import { aiService } from "../services/ai.service";
import { investmentService } from "../services/investment.service";
import ReactMarkdown from 'react-markdown';

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [budgetSuggestions, setBudgetSuggestions] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState<string>("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState({ name: "", value: "", type: "" });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [newRecurring, setNewRecurring] = useState({ description: "", amount: "", frequency: "monthly", type: "expense", nextDate: "" });
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [addingAmountToGoal, setAddingAmountToGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [processedRecurringDates, setProcessedRecurringDates] = useState<{[key: string]: string}>({});
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Category options
  const expenseCategories = [
    "Food & Dining",
    "Transport", 
    "Rent & Utilities",
    "Shopping",
    "Entertainment",
    "Health & Fitness",
    "Education",
    "Bills & Recharge",
    "Gifts & Donations",
    "Others / Miscellaneous"
  ];
  const incomeCategories = [
    "Salary / Stipend",
    "Pocket Money / Parental Support",
    "Freelance / Part-time Work",
    "Investment Returns",
  ];

  // Load data on component mount - handled in existing useEffect below

  // Check and process recurring transactions
  useEffect(() => {
    const processRecurringTransactions = () => {
      if (!user?.id || recurringTransactions.length === 0) return;

      const today = new Date().toISOString().split('T')[0];
      let hasUpdates = false;
      const updatedRecurring = [...recurringTransactions];
      const newTransactions = [...transactions];
      const updatedProcessedDates = { ...processedRecurringDates };

      recurringTransactions.forEach((recurring, index) => {
        const nextDate = new Date(recurring.nextDate);
        const todayDate = new Date(today);
        
        // Create unique key for this recurring transaction and date
        const processKey = `${recurring.id}_${recurring.nextDate}`;

        if (nextDate <= todayDate && !updatedProcessedDates[processKey]) {
          // Check if this exact transaction already exists to prevent duplicates
          const existingTransaction = transactions.find(t => 
            t.description === `${recurring.description} (Auto)` &&
            t.date === recurring.nextDate &&
            t.amount === recurring.amount &&
            t.type === recurring.type
          );

          if (!existingTransaction) {
            // Add transaction
            const newTransaction = {
              id: Date.now() + Math.random(),
              type: recurring.type,
              amount: recurring.amount,
              category: recurring.type === 'expense' ? 'Recurring Expense' : 'Recurring Income',
              description: `${recurring.description} (Auto)`,
              date: recurring.nextDate
            };
            newTransactions.push(newTransaction);

            // Mark this date as processed
            updatedProcessedDates[processKey] = today;

            // Calculate next date based on frequency
            const nextRecurringDate = new Date(recurring.nextDate);
            switch (recurring.frequency) {
              case 'daily':
                nextRecurringDate.setDate(nextRecurringDate.getDate() + 1);
                break;
              case 'weekly':
                nextRecurringDate.setDate(nextRecurringDate.getDate() + 7);
                break;
              case 'monthly':
                nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 1);
                break;
              case 'quarterly':
                nextRecurringDate.setMonth(nextRecurringDate.getMonth() + 3);
                break;
              case 'yearly':
                nextRecurringDate.setFullYear(nextRecurringDate.getFullYear() + 1);
                break;
            }

            updatedRecurring[index] = {
              ...recurring,
              nextDate: nextRecurringDate.toISOString().split('T')[0]
            };

            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        setTransactions(newTransactions);
        setRecurringTransactions(updatedRecurring);
        setProcessedRecurringDates(updatedProcessedDates);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(newTransactions));
        localStorage.setItem(`recurringTransactions_${user.id}`, JSON.stringify(updatedRecurring));
        localStorage.setItem(`processedRecurringDates_${user.id}`, JSON.stringify(updatedProcessedDates));
        toast.success("Recurring transactions processed automatically!");
      }
    };

    // Only process if we have loaded the data
    if (user?.id && recurringTransactions.length > 0) {
      processRecurringTransactions();
    }

    // Set up interval to check every hour (but only after initial load)
    const interval = setInterval(() => {
      if (user?.id && recurringTransactions.length > 0) {
        processRecurringTransactions();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, recurringTransactions.length]); // Removed transactions dependency to prevent excessive re-runs

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-panel') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setIsDashboardLoading(true);
      Promise.all([
        transactionService.getAllTransactions(),
        budgetService.getBudgets(),
        goalService.getGoals(),
        investmentService.getInvestments()
      ])
      .then(([transactionsData, budgetsData, goalsData, investmentsData]) => {
        setTransactions(transactionsData);
        generateBudgetSuggestions(transactionsData);
        generateNotifications(transactionsData);

        // Map backend goals (title) to frontend (name)
        const mappedGoals = goalsData.map((g: any) => ({
          ...g,
          name: g.title
        }));
        setGoals(mappedGoals);

        setInvestments(investmentsData);

        // Map budget limit for the "Total" category
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const totalBudget = budgetsData.find((b: any) => b.category === "Total" && b.month === currentMonth && b.year === currentYear);
        if (totalBudget) {
          setMonthlyBudget(totalBudget.limit.toString());
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data', err);
        toast.error("Failed to load dashboard data from server");
      })
      .finally(() => {
        setIsDashboardLoading(false);
      });
      
      // Fetch AI Insights independently so it doesn't block the main dashboard
      setIsInsightsLoading(true);
      aiService.getDashboardInsights()
        .then(data => setAiInsights(data))
        .catch(err => console.error('Failed to load AI insights', err))
        .finally(() => setIsInsightsLoading(false));

      const savedRecurring = localStorage.getItem(`recurring_${user.id}`);
      if (savedRecurring) {
        setRecurringTransactions(JSON.parse(savedRecurring));
      }

      // Load processed recurring dates
      const savedProcessedDates = localStorage.getItem(`processedRecurringDates_${user.id}`);
      if (savedProcessedDates) {
        setProcessedRecurringDates(JSON.parse(savedProcessedDates));
      }
    }
  }, [authLoading, isAuthenticated, navigate, user]);

  const generateBudgetSuggestions = (transactionData: Transaction[]) => {
    const monthlyExpenses = transactionData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const monthlyIncome = transactionData
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const categorySpending = transactionData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const suggestions = [
      {
        category: 'Emergency Fund',
        suggestion: `Save ₹${(monthlyIncome * 0.2).toFixed(0)} monthly (20% of income)`,
        priority: 'high',
        icon: Target
      },
      {
        category: 'Food Budget',
        suggestion: `Limit food expenses to ₹${(monthlyIncome * 0.15).toFixed(0)} monthly`,
        priority: Object.keys(categorySpending).includes('Food') && categorySpending['Food'] > monthlyIncome * 0.15 ? 'high' : 'medium',
        icon: PieChart
      },
      {
        category: 'Investment',
        suggestion: `Invest ₹${(monthlyIncome * 0.3).toFixed(0)} monthly for long-term growth`,
        priority: 'medium',
        icon: TrendingUp
      }
    ];

    setBudgetSuggestions(suggestions);
  };

  const generateNotifications = (transactionData: Transaction[]) => {
    const currentMonth = new Date().getMonth();
    const notifications = [];
    
    // Budget alerts
    const monthlyExpenses = transactionData
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && transactionDate.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const budget = parseFloat(monthlyBudget) || 0;
    if (budget > 0) {
      const budgetUsed = (monthlyExpenses / budget) * 100;
      if (budgetUsed > 80) {
        notifications.push({
          id: 1,
          type: 'warning',
          title: 'Budget Alert',
          message: `You're ${budgetUsed.toFixed(0)}% through your monthly budget`,
          time: '2 min ago'
        });
      }
    }
    
    // Category spending alerts
    const categoryExpenses = transactionData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    Object.entries(categoryExpenses).forEach(([category, amount]) => {
      if (amount > 2000) {
        notifications.push({
          id: notifications.length + 1,
          type: 'info',
          title: 'Spending Pattern',
          message: `High spending detected in ${category}: ₹${amount.toFixed(0)}`,
          time: '1 hour ago'
        });
      }
    });
    
    // Cash flow prediction
    const totalIncome = transactionData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactionData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = totalIncome - totalExpense;
    
    if (currentBalance < 5000) {
      notifications.push({
        id: notifications.length + 1,
        type: 'warning',
        title: 'Cash Flow Alert',
        message: `Your balance is low: ₹${currentBalance.toFixed(0)}. Plan ahead!`,
        time: '30 min ago'
      });
    }
    
    setNotifications(notifications);
  };
  
  const handleSetBudget = async () => {
    if (monthlyBudget && user) {
      setIsActionLoading(true);
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        await budgetService.createBudget({
          category: "Total",
          limit: parseFloat(monthlyBudget),
          month: currentMonth,
          year: currentYear
        });

        generateBudgetSuggestions(transactions);
        generateNotifications(transactions);
        toast.success('Monthly budget set successfully!');
      } catch (err) {
        console.error('Failed to set budget', err);
        toast.error('Failed to set monthly budget');
      } finally {
        setIsActionLoading(false);
      }
    }
  };
  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userMessage = chatInput.trim();
    if (!userMessage) return;
    
    setChatInput('');
    
    const userMessageObj = {
      id: Date.now(),
      type: 'user',
      message: userMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const loadingMessageObj = {
      id: Date.now() + 1,
      type: 'ai',
      message: 'Thinking...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMessageObj, loadingMessageObj]);
    
    try {
      const response = await aiService.chat(userMessage);
      
      const aiResponseObj = {
        id: Date.now() + 2,
        type: 'ai',
        message: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev.filter(m => m.id !== loadingMessageObj.id), aiResponseObj]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to get AI response');
      setChatMessages(prev => prev.filter(m => m.id !== loadingMessageObj.id));
    }
  };

  const handleAddInvestment = async () => {
    if (!newInvestment.name || !newInvestment.value || !newInvestment.type) {
      toast.error("Please fill in all investment fields");
      return;
    }

    setIsActionLoading(true);
    try {
      await investmentService.createInvestment({
        name: newInvestment.name,
        value: parseFloat(newInvestment.value),
        type: newInvestment.type
      });

      const [updatedInvestmentsData, updatedTransactionsData] = await Promise.all([
        investmentService.getInvestments(),
        transactionService.getAllTransactions()
      ]);

      setInvestments(updatedInvestmentsData);
      setTransactions(updatedTransactionsData);
      generateBudgetSuggestions(updatedTransactionsData);
      
      setNewInvestment({ name: "", value: "", type: "" });
      setShowAddInvestment(false);
      toast.success("Investment added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add investment");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteInvestment = async (id: string | number) => {
    setIsActionLoading(true);
    try {
      if (typeof id === 'string') {
        await investmentService.deleteInvestment(id);
      }
      
      const [updatedInvestmentsData, updatedTransactionsData] = await Promise.all([
        investmentService.getInvestments(),
        transactionService.getAllTransactions()
      ]);

      setInvestments(updatedInvestmentsData);
      setTransactions(updatedTransactionsData);
      generateBudgetSuggestions(updatedTransactionsData);
      
      toast.success("Investment removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove investment");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openExternalLink = (platform: string) => {
    const links = {
      zerodha: "https://zerodha.com",
      groww: "https://groww.in",
      paytm: "https://www.paytmmoney.com"
    };
    window.open(links[platform as keyof typeof links], '_blank');
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error("Please fill in all goal fields");
      return;
    }

    setIsActionLoading(true);
    try {
      const addedGoal = await goalService.createGoal({
        title: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        deadline: new Date(newGoal.deadline).toISOString()
      });
      
      const mappedGoal = { ...addedGoal, name: addedGoal.title };
      setGoals([...goals, mappedGoal]);
      
      setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
      setShowAddGoal(false);
      toast.success("Goal added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add goal");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddRecurring = () => {
    if (!newRecurring.description || !newRecurring.amount || !newRecurring.nextDate) {
      toast.error("Please fill in all recurring transaction fields");
      return;
    }

    const recurring = {
      id: Date.now(),
      description: newRecurring.description,
      amount: parseFloat(newRecurring.amount),
      frequency: newRecurring.frequency,
      type: newRecurring.type,
      nextDate: newRecurring.nextDate,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updatedRecurring = [...recurringTransactions, recurring];
    setRecurringTransactions(updatedRecurring);
    localStorage.setItem(`recurring_${user.id}`, JSON.stringify(updatedRecurring));
    
    setNewRecurring({ description: "", amount: "", frequency: "monthly", type: "expense", nextDate: "" });
    setShowAddRecurring(false);
    toast.success("Recurring transaction added successfully!");
  };

  const deleteGoal = async (goalId: string | number) => {
    setIsActionLoading(true);
    try {
      if (typeof goalId === 'string') {
        await goalService.deleteGoal(goalId);
      }
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success("Goal deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete goal");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddAmountToGoal = async (goalId: string | number) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsActionLoading(true);
    try {
      let updatedGoalData;
      if (typeof goalId === 'string') {
        updatedGoalData = await goalService.addProgress(goalId, parseFloat(addAmount));
      } else {
        // Fallback for UI if it's purely local
        updatedGoalData = goals.find(g => g.id === goalId);
        if (updatedGoalData) {
          updatedGoalData.currentAmount += parseFloat(addAmount);
          if (updatedGoalData.currentAmount >= updatedGoalData.targetAmount) {
             updatedGoalData.completed = true;
          }
        }
      }

      if (updatedGoalData) {
        const mappedUpdated = { ...updatedGoalData, name: updatedGoalData.title || goals.find(g => g.id === goalId)?.name };
        setGoals(goals.map(g => g.id === goalId ? mappedUpdated : g));
        
        const goalName = mappedUpdated.name;
        toast.success(`₹${addAmount} added to ${goalName}!`);
        if (mappedUpdated.completed && !goals.find(g => g.id === goalId)?.completed) {
           toast.success(`Congratulations! You reached your goal: ${goalName}`);
        }
      }
      
      setAddingAmountToGoal(null);
      setAddAmount("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add progress");
    } finally {
      setIsActionLoading(false);
    }
  };

  const editGoal = (goal: any) => {
    setEditingGoal({
      ...goal,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString()
    });
    setShowEditGoal(true);
  };

  const handleEditGoal = async () => {
    if (!editingGoal.name || !editingGoal.targetAmount || !editingGoal.deadline) {
      toast.error("Please fill in all goal fields");
      return;
    }

    setIsActionLoading(true);
    try {
      let updatedGoalData;
      if (typeof editingGoal.id === 'string') {
        updatedGoalData = await goalService.updateGoal(editingGoal.id, {
          title: editingGoal.name,
          targetAmount: parseFloat(editingGoal.targetAmount),
          deadline: new Date(editingGoal.deadline).toISOString()
        });
      } else {
         updatedGoalData = {
           ...editingGoal,
           targetAmount: parseFloat(editingGoal.targetAmount),
           currentAmount: parseFloat(editingGoal.currentAmount) || 0,
         };
      }

      const mappedUpdated = { ...updatedGoalData, name: updatedGoalData.title || editingGoal.name };
      setGoals(goals.map(g => g.id === editingGoal.id ? mappedUpdated : g));
      
      setEditingGoal(null);
      setShowEditGoal(false);
      toast.success("Goal updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update goal");
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteRecurring = (recurringId: number) => {
    const updatedRecurring = recurringTransactions.filter(r => r.id !== recurringId);
    setRecurringTransactions(updatedRecurring);
    localStorage.setItem(`recurring_${user.id}`, JSON.stringify(updatedRecurring));
    toast.success("Recurring transaction deleted successfully!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      let newTransactions: Transaction[] = [];

      if (file.name.endsWith('.csv')) {
        // Enhanced CSV parsing with multiple format support
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header if it exists (check if first line contains non-numeric amount)
        const startIndex = lines.length > 0 && isNaN(parseFloat(lines[0].split(',')[2])) ? 1 : 0;
        
        newTransactions = lines
          .slice(startIndex)
          .map((line, index) => {
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            
            // Support multiple CSV formats
            let date, description, amount, category, type;
            
            if (columns.length >= 3) {
              // Format 1: date,description,amount,category,type
              if (columns.length >= 5) {
                [date, description, amount, category, type] = columns;
              }
              // Format 2: date,description,amount (auto-detect expense)
              else if (columns.length >= 3) {
                [date, description, amount] = columns;
                category = 'Others / Miscellaneous';
                type = parseFloat(amount) < 0 ? 'expense' : 'income';
                amount = Math.abs(parseFloat(amount)).toString();
              }
              
              // Parse date
              let parsedDate = new Date().toISOString().split('T')[0];
              if (date) {
                const dateFormats = [
                  /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
                  /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
                  /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
                ];
                
                if (dateFormats.some(format => format.test(date))) {
                  const dateObj = new Date(date);
                  if (!isNaN(dateObj.getTime())) {
                    parsedDate = dateObj.toISOString().split('T')[0];
                  }
                }
              }
              
              const parsedAmount = parseFloat(amount?.replace(/[^\d.-]/g, '') || '0');
              
              if (parsedAmount > 0 && description) {
                return {
                  id: Date.now() + index,
                  date: parsedDate,
                  description: description || 'Imported transaction',
                  amount: parsedAmount,
                  category: category || 'Others / Miscellaneous',
                  type: (type?.toLowerCase() === 'income' ? 'income' : 'expense') as 'income' | 'expense'
                };
              }
            }
            return null;
          })
          .filter((transaction): transaction is Transaction => transaction !== null);
      }
      // Handle other file formats
      else if (file.name.endsWith('.txt')) {
        // Simple text format parsing
        const lines = text.split('\n').filter(line => line.trim());
        newTransactions = lines
          .map((line, index) => {
            const parts = line.split(/[\s,]+/);
            if (parts.length >= 2) {
              const amount = parseFloat(parts[parts.length - 1]);
              const description = parts.slice(0, -1).join(' ');
              
              if (!isNaN(amount) && description) {
                return {
                  id: Date.now() + index,
                  date: new Date().toISOString().split('T')[0],
                  description,
                  amount: Math.abs(amount),
                  category: 'Others / Miscellaneous',
                  type: (amount < 0 ? 'expense' : 'income') as 'income' | 'expense'
                };
              }
            }
            return null;
          })
          .filter((transaction): transaction is Transaction => transaction !== null);
      }

      if (newTransactions.length > 0) {
        const updatedTransactions = [...newTransactions, ...transactions];
        setTransactions(updatedTransactions);
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
        generateBudgetSuggestions(updatedTransactions);
        toast.success(`Imported ${newTransactions.length} transactions successfully!`);
      } else {
        toast.error('No valid transactions found. Please check your file format.\n\nSupported formats:\n- CSV: date,description,amount,category,type\n- CSV: date,description,amount\n- TXT: description amount');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Error processing file. Please check the format and try again.');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const newTransaction = await transactionService.createTransaction({
        description,
        amount: parseFloat(amount),
        category,
        type,
        date
      });

      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      generateBudgetSuggestions(updatedTransactions);
      
      toast.success("Transaction added!");
      setDescription("");
      setAmount("");
      setCategory("");
    } catch (error) {
      console.error("Failed to add transaction", error);
      toast.error("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (id: string | number) => {
    try {
      if (typeof id === 'string') {
        await transactionService.deleteTransaction(id);
      }
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      toast.success("Transaction deleted");
    } catch (error) {
      console.error("Failed to delete transaction", error);
      toast.error("Failed to delete transaction");
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Summaries Calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDateStr = now.toISOString().split('T')[0];
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const calculateSummary = (filterFn: (t: Transaction) => boolean) => {
    const filtered = transactions.filter(filterFn);
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      savings: income - expense,
      count: filtered.length
    };
  };

  const dailySummary = calculateSummary(t => t.date.startsWith(currentDateStr));
  
  const monthlySummary = calculateSummary(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const weeklySummary = calculateSummary(t => {
    const d = new Date(t.date);
    return d >= oneWeekAgo && d <= now;
  });

  // Enhanced analytics calculations
  const getDailyAverage = () => {
    const expenseTransactions = transactions.filter(t => t.type === "expense");
    if (expenseTransactions.length === 0) return 0;
    
    const dates = [...new Set(expenseTransactions.map(t => t.date))];
    const totalDays = dates.length || 1;
    return totalExpense / totalDays;
  };

  const getWeeklyPattern = () => {
    const weeklyData = Array(7).fill(0);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    transactions.filter(t => t.type === "expense").forEach(t => {
      const dayOfWeek = new Date(t.date).getDay();
      weeklyData[dayOfWeek] += t.amount;
    });
    
    return weeklyData.map((amount, index) => ({
      day: weekDays[index],
      amount
    }));
  };

  const getTopCategories = () => {
    const categoryTotals = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
  };

  const getSavingsRate = () => {
    if (totalIncome === 0) return 0;
    return ((balance / totalIncome) * 100);
  };

  const dailyAverage = getDailyAverage();
  const weeklyPattern = getWeeklyPattern();
  const topCategories = getTopCategories();
  const savingsRate = getSavingsRate();

  // Prepare chart data - only expenses for spending trends
  const chartData = transactions
    .filter(t => t.type === 'expense') // Only show expenses in spending trends
    .slice(0, 10)
    .reverse()
    .map((t, index) => ({
      name: t.description.substring(0, 10),
      amount: t.amount,
      type: t.type,
      date: t.date
    }));

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 relative">
      <AnimatedBackground />
      {/* Navbar */}
      <nav className="glass neon-border rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/spendwise-logo.svg" alt="SpendWise AI" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                SpendWise AI
              </h1>
              <p className="text-xs text-foreground/60">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-button relative text-foreground/70 hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
            </div>
            
            {/* AI Chatbot */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChatbot(!showChatbot)}
              className="text-foreground/70 hover:text-foreground"
            >
              <Bot className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className="border-border/50 hover:border-primary hover:bg-accent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass neon-border glow-on-hover animate-fade-in">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-tertiary' : 'text-destructive'}`}>
                ₹{balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass neon-border glow-on-hover animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-tertiary">₹{totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="glass neon-border glow-on-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">₹{totalExpense.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 glass neon-border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="add-transaction" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Transaction
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Smart Budget
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="ai-advisor" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Advisor
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Trends Chart */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Spending Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => {
                          if (percent < 0.05) return ''; // Hide labels for slices < 5%
                          return `${name.length > 10 ? name.substring(0, 10) + '...' : name} ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={90}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          color: '#1f2937',
                          fontSize: '14px',
                          fontWeight: '500',
                          backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{
                          color: '#1f2937',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                        formatter={(value: number, name: string) => [
                          `₹${value.toFixed(2)}`,
                          name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Average Spending */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Daily Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">₹{dailyAverage.toFixed(0)}</p>
                  <p className="text-xs text-foreground/60 mt-1">per day spending</p>
                </CardContent>
              </Card>

              {/* Savings Rate */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Savings Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-tertiary' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {savingsRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">of income saved</p>
                  </div>
                  <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Saved', value: Math.max(savingsRate, 0) },
                            { name: 'Remaining', value: Math.max(100 - savingsRate, 0) }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={30}
                          startAngle={90}
                          endAngle={450}
                          dataKey="value"
                        >
                          <Cell fill={savingsRate >= 20 ? 'hsl(var(--tertiary))' : savingsRate >= 10 ? '#eab308' : '#ef4444'} />
                          <Cell fill="hsl(var(--accent))" />
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Category */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Top Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-secondary">
                    {topCategories[0]?.category || 'No data'}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    ₹{topCategories[0]?.amount.toFixed(0) || '0'} spent
                  </p>
                </CardContent>
              </Card>

              {/* Weekly High */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Weekly High
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-tertiary">
                    {weeklyPattern.reduce((max, day) => day.amount > max.amount ? day : max, weeklyPattern[0])?.day || 'N/A'}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">highest spending day</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Pattern Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Weekly Spending Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(250, weeklyPattern.length * 35 + 100)}>
                    <BarChart data={weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '2px solid hsl(var(--primary))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          color: 'white'
                        }}
                        labelStyle={{ color: 'white', fontWeight: '600' }}
                        formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Categories List */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Top Spending Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topCategories.length > 0 ? (
                    topCategories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{cat.amount.toFixed(0)}</p>
                          <p className="text-xs text-foreground/60">
                            {((cat.amount / totalExpense) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60 text-center py-8">No spending data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="add-transaction">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Transaction Form */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    Add Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTransaction} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={type === "expense" ? "default" : "outline"}
                          className={type === "expense" ? "flex-1 bg-gradient-to-r from-secondary to-primary" : "flex-1"}
                          onClick={() => setType("expense")}
                        >
                          Expense
                        </Button>
                        <Button
                          type="button"
                          variant={type === "income" ? "default" : "outline"}
                          className={type === "income" ? "flex-1 bg-gradient-to-r from-tertiary to-primary" : "flex-1"}
                          onClick={() => setType("income")}
                        >
                          Income
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Grocery shopping"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-input/50 border-border/50 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                          const value = Math.max(0, parseFloat(e.target.value) || 0);
                          setAmount(value.toString());
                        }}
                        className="bg-input/50 border-border/50 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="glass neon-border">
                          {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                            <SelectItem key={cat} value={cat} className="hover:bg-primary/10">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Input
                          id="date"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-input/50 border-border/50 focus:border-primary pr-10 text-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                          style={{
                            colorScheme: 'dark'
                          }}
                        />
                        <Calendar 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none z-10" 
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary via-secondary to-tertiary shadow-[var(--shadow-neon-blue)] hover:shadow-[var(--shadow-glow)]"
                    >
                      Add Transaction
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Summaries */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-background/50 border border-border/50">
                      <TabsTrigger value="monthly">This Month</TabsTrigger>
                      <TabsTrigger value="weekly">This Week</TabsTrigger>
                      <TabsTrigger value="daily">Today</TabsTrigger>
                    </TabsList>
                    
                    {[
                      { id: 'monthly', data: monthlySummary },
                      { id: 'weekly', data: weeklySummary },
                      { id: 'daily', data: dailySummary }
                    ].map(summary => (
                      <TabsContent key={summary.id} value={summary.id} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-xl text-center border border-border/30 hover:border-green-500/50 transition-colors">
                            <p className="text-sm text-foreground/70 mb-2">Income</p>
                            <p className="text-2xl font-bold text-green-400">₹{summary.data.income.toLocaleString()}</p>
                          </div>
                          <div className="glass p-4 rounded-xl text-center border border-border/30 hover:border-red-500/50 transition-colors">
                            <p className="text-sm text-foreground/70 mb-2">Expense</p>
                            <p className="text-2xl font-bold text-red-400">₹{summary.data.expense.toLocaleString()}</p>
                          </div>
                          <div className="glass p-4 rounded-xl text-center border border-border/30 hover:border-primary/50 transition-colors">
                            <p className="text-sm text-foreground/70 mb-2">Savings</p>
                            <p className="text-2xl font-bold text-primary">₹{summary.data.savings.toLocaleString()}</p>
                          </div>
                          <div className="glass p-4 rounded-xl text-center border border-border/30 hover:border-secondary/50 transition-colors">
                            <p className="text-sm text-foreground/70 mb-2">Transactions</p>
                            <p className="text-2xl font-bold text-foreground">{summary.data.count}</p>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Spending Bar Chart */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Monthly Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(300, categoryData.length * 40 + 100)}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '2px solid hsl(var(--primary))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          color: 'white'
                        }}
                        labelStyle={{ color: 'white', fontWeight: '600' }}
                        formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Transactions List */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {transactions.length === 0 ? (
                      <p className="text-foreground/50 text-center py-8">No transactions yet. Add your first one!</p>
                    ) : (
                      transactions.slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="glass p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{transaction.description}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-foreground/70">
                                  {transaction.category}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/60">{transaction.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-tertiary' : 'text-secondary'}`}>
                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Smart Budget Assistant */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <Target className="w-5 h-5 text-primary" />
                    Smart Budget Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Budget Setting */}
                  <div className="space-y-3">
                    <Label htmlFor="monthly-budget">Set Monthly Budget</Label>
                    <div className="flex gap-2">
                      <Input
                        id="monthly-budget"
                        type="number"
                        placeholder="25000"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        className="bg-input/50 border-border/50 focus:border-primary"
                      />
                      <Button onClick={handleSetBudget} className="bg-gradient-to-r from-primary to-secondary">
                        Set Budget
                      </Button>
                    </div>
                  </div>
                  
                  {/* Budget Progress */}
                  {monthlyBudget && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Used</span>
                        <span>{((transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0) / parseFloat(monthlyBudget)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(((transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0) / parseFloat(monthlyBudget)) * 100), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Predictions & Alerts */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">AI Predictions & Alerts</h4>
                    {budgetSuggestions.length === 0 ? (
                      <p className="text-foreground/50 text-center py-8">Add some transactions to get personalized budget suggestions!</p>
                    ) : (
                      budgetSuggestions.map((suggestion, index) => {
                        const IconComponent = suggestion.icon;
                        return (
                          <div
                            key={index}
                            className={`glass p-4 rounded-lg border ${
                              suggestion.priority === 'high' 
                                ? 'border-secondary/50 bg-secondary/5' 
                                : 'border-border/50'
                            } hover:border-primary/50 transition-all`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                suggestion.priority === 'high' 
                                  ? 'bg-secondary/20 text-secondary' 
                                  : 'bg-primary/20 text-primary'
                              }`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{suggestion.category}</h4>
                                <p className="text-sm text-foreground/70">{suggestion.suggestion}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
                                  suggestion.priority === 'high' 
                                    ? 'bg-secondary/20 text-secondary' 
                                    : 'bg-primary/20 text-primary'
                                }`}>
                                  {suggestion.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Health Score */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Financial Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score Circle - Centered */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Score', value: Math.max(savingsRate * 1.2 + 20, 0) },
                              { name: 'Remaining', value: Math.max(100 - (savingsRate * 1.2 + 20), 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            <Cell fill="#fbbf24" />
                            <Cell fill="hsl(var(--accent))" />
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">
                          {Math.round(Math.max(savingsRate * 1.2 + 20, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health Metrics - Below Circle */}
                  <div className="space-y-4">
                    {/* Savings Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Savings Rate</span>
                        <span className="text-sm font-bold text-tertiary">{savingsRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-tertiary to-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(savingsRate, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60">
                        {savingsRate >= 20 ? "Excellent savings rate!" : savingsRate >= 10 ? "Good progress, aim for 20%" : "Focus on increasing savings"}
                      </p>
                    </div>

                    {/* Budget Adherence */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Budget Adherence</span>
                        <span className="text-sm font-bold text-secondary">
                          {monthlyBudget ? Math.max(100 - ((transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0) / parseFloat(monthlyBudget)) * 100), 0).toFixed(0) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${monthlyBudget ? Math.max(100 - ((transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0) / parseFloat(monthlyBudget)) * 100), 0) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60">
                        {monthlyBudget ? `₹${(parseFloat(monthlyBudget) - transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0)).toFixed(0)} remaining this month` : "Set a budget to track adherence"}
                      </p>
                    </div>

                    {/* Spending Consistency */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Spending Consistency</span>
                        <span className="text-sm font-bold text-tertiary">85%</span>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-tertiary to-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: '85%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60">Your spending patterns are fairly consistent</p>
                    </div>

                    {/* Emergency Fund */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Emergency Fund</span>
                        <span className="text-sm font-bold text-tertiary">
                          {(() => {
                            const emGoal = goals.find(g => g.name?.toLowerCase().includes('emergency'));
                            if (!emGoal) return 0;
                            return Math.round((emGoal.currentAmount || 0) / (emGoal.targetAmount || 1) * 100);
                          })()}%
                        </span>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-tertiary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(() => {
                              const emGoal = goals.find(g => g.name?.toLowerCase().includes('emergency'));
                              if (!emGoal) return 0;
                              return Math.min((emGoal.currentAmount || 0) / (emGoal.targetAmount || 1) * 100, 100);
                            })()}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60">
                        {(() => {
                          const emGoal = goals.find(g => g.name?.toLowerCase().includes('emergency'));
                          if (!emGoal) return "Create an emergency fund goal";
                          return `₹${(emGoal.currentAmount || 0).toFixed(0)} saved`;
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Portfolio */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Investment Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investments.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-foreground/60 mb-4">Connect your investment accounts</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="text-sm"
                          onClick={() => openExternalLink('zerodha')}
                        >
                          Connect Zerodha
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-sm"
                          onClick={() => openExternalLink('groww')}
                        >
                          Connect Groww
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-sm"
                          onClick={() => openExternalLink('paytm')}
                        >
                          Connect Paytm Money
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-sm bg-gradient-to-r from-primary/20 to-secondary/20"
                          onClick={() => setShowAddInvestment(true)}
                        >
                          Add Manually
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Your Investments</h3>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-primary to-secondary"
                          onClick={() => setShowAddInvestment(true)}
                        >
                          Add Investment
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {investments.map((investment) => (
                          <div key={investment.id} className="glass p-4 rounded-lg border border-border/50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-primary">{investment.name}</h4>
                                <p className="text-sm text-foreground/60 capitalize">{investment.type.replace('-', ' ')}</p>
                                <p className="text-xs text-foreground/50 mt-1">
                                  Added: {new Date(investment.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-tertiary">₹{investment.value.toFixed(0)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-green-500">+2.3%</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteInvestment(investment.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total Portfolio Value</span>
                          <span className="text-xl font-bold text-tertiary">
                            ₹{investments.reduce((sum, inv) => sum + inv.value, 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Net Worth Dashboard */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Net Worth Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total Net Worth */}
                  <div className="text-center bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-lg p-4 border border-primary/20">
                    <div className="text-3xl font-bold bg-gradient-to-r from-tertiary to-primary bg-clip-text text-transparent mb-1">
                      ₹{(balance + investments.reduce((sum, inv) => sum + inv.value, 0)).toFixed(0)}
                    </div>
                    <p className="text-foreground/70 text-sm">Total Net Worth</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-semibold">+5.2% this month</span>
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="space-y-3">
                    {/* Cash & Bank */}
                    <div className="glass p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Cash & Bank</h4>
                            <p className="text-xs text-foreground/60">Liquid assets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-400">₹{balance.toFixed(0)}</div>
                          <div className="text-xs text-foreground/60">
                            {((balance / (balance + investments.reduce((sum, inv) => sum + inv.value, 0))) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((balance / (balance + investments.reduce((sum, inv) => sum + inv.value, 0))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Investments */}
                    <div className="glass p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Investments</h4>
                            <p className="text-xs text-foreground/60">Growth assets</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">₹{investments.reduce((sum, inv) => sum + inv.value, 0).toFixed(0)}</div>
                          <div className="text-xs text-foreground/60">
                            {(((investments.reduce((sum, inv) => sum + inv.value, 0)) / (balance + investments.reduce((sum, inv) => sum + inv.value, 0))) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(((investments.reduce((sum, inv) => sum + inv.value, 0)) / (balance + investments.reduce((sum, inv) => sum + inv.value, 0))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Monthly Growth */}
                    <div className="glass p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-tertiary/20 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-tertiary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Monthly Growth</h4>
                            <p className="text-xs text-foreground/60">Net worth increase</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-tertiary">+₹2,500</div>
                          <div className="text-xs text-green-500">+5.2%</div>
                        </div>
                      </div>
                      <div className="w-full bg-accent/20 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-tertiary to-primary h-1.5 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Advisor Tab */}
          <TabsContent value="ai-advisor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Financial Advisor */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    AI Financial Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isInsightsLoading ? (
                    <div className="space-y-3">
                      <div className="glass p-4 rounded-lg border border-primary/20 animate-pulse h-20"></div>
                      <div className="glass p-4 rounded-lg border border-secondary/20 animate-pulse h-20"></div>
                      <div className="glass p-4 rounded-lg border border-tertiary/20 animate-pulse h-20"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="glass p-4 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Investment Suggestion</h4>
                            <p className="text-sm text-foreground/70">{aiInsights?.investmentSuggestion || "Not enough data to provide suggestions yet."}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="glass p-4 rounded-lg border border-secondary/20">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Budget Optimization</h4>
                            <p className="text-sm text-foreground/70">{aiInsights?.budgetOptimization || "Not enough data to optimize your budget yet."}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="glass p-4 rounded-lg border border-tertiary/20">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-tertiary/20 text-tertiary">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Savings Goal</h4>
                            <p className="text-sm text-foreground/70">{aiInsights?.savingsGoal || "Not enough data to track savings goals yet."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cash Flow Prediction */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Cash Flow Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isInsightsLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 glass rounded-lg animate-pulse"></div>
                      <div className="h-16 glass rounded-lg animate-pulse"></div>
                      <div className="h-20 glass rounded-lg animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      {/* Monthly Projection */}
                      <div className="flex items-center justify-between p-4 glass rounded-lg">
                        <div>
                          <p className="text-sm text-foreground/70">Projected Month-End Spending</p>
                          <p className="text-xl font-bold text-secondary">
                            ₹{aiInsights?.projectedMonthEndSpending || 0}
                          </p>
                          <p className="text-xs text-foreground/60 mt-1">
                            Calculated dynamically via AI algorithms
                          </p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-secondary" />
                      </div>

                      {/* Budget Comparison */}
                      {monthlyBudget && (
                        <div className="p-4 glass rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Budget vs Projection</span>
                            <span className={`text-sm font-bold ${
                              (aiInsights?.projectedMonthEndSpending || 0) > parseFloat(monthlyBudget) 
                                ? 'text-red-500' : 'text-tertiary'
                            }`}>
                              {(aiInsights?.projectedMonthEndSpending || 0) > parseFloat(monthlyBudget) 
                                ? `+₹${Math.round((aiInsights?.projectedMonthEndSpending || 0) - parseFloat(monthlyBudget))} over` 
                                : `₹${Math.round(parseFloat(monthlyBudget) - (aiInsights?.projectedMonthEndSpending || 0))} under`
                              }
                            </span>
                          </div>
                          <div className="w-full bg-accent/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${(aiInsights?.projectedMonthEndSpending || 0) > parseFloat(monthlyBudget) ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
                              style={{ 
                                width: `${Math.min(((aiInsights?.projectedMonthEndSpending || 0) / parseFloat(monthlyBudget)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Insights */}
                      <div className="flex gap-4">
                        <div className="flex-1 p-4 glass rounded-lg border border-accent/20">
                          <p className="text-sm text-foreground/70 mb-1">Budget Runaway</p>
                          <p className="text-lg font-bold text-tertiary flex items-center gap-2">
                            {aiInsights?.budgetRunawayDays || 0} days
                            {(aiInsights?.budgetRunawayDays || 0) < 10 && <AlertTriangle className="w-4 h-4 text-secondary" />}
                          </p>
                          <p className="text-xs text-foreground/60 mt-1">Days until budget is exhausted</p>
                        </div>
                      </div>

                      {/* Alerts */}
                      {aiInsights?.budgetOverrunAlert && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-red-500 mb-1">AI Budget Alert</h4>
                            <p className="text-xs text-red-500/80">
                              {aiInsights.budgetOverrunAlert}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="goals">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Goals */}
              <Card className="glass neon-border animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <Target className="w-5 h-5 text-primary" />
                    Financial Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-foreground/60 mb-4">Set your financial goals and track progress</p>
                      <Button 
                        className="bg-gradient-to-r from-primary to-secondary"
                        onClick={() => setShowAddGoal(true)}
                      >
                        Add New Goal
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Your Goals</h3>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-primary to-secondary"
                          onClick={() => setShowAddGoal(true)}
                        >
                          Add Goal
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {goals.map((goal) => {
                          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                          return (
                            <div key={goal.id} className="glass p-4 rounded-lg border border-primary/20">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{goal.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-tertiary font-bold">{progress.toFixed(0)}%</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteGoal(goal.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-foreground/70">
                                  ₹{goal.currentAmount.toFixed(0)} / ₹{goal.targetAmount.toFixed(0)}
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAddingAmountToGoal(addingAmountToGoal === goal.id ? null : goal.id)}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  <PlusCircle className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>

                              {/* Inline Add Amount UI */}
                              {addingAmountToGoal === goal.id && (
                                <div className="mb-3 p-3 glass rounded-lg border border-primary/30">
                                  <div className="space-y-2">
                                    <Label htmlFor={`add-amount-${goal.id}`} className="text-sm font-medium">
                                      Add Amount (₹)
                                    </Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id={`add-amount-${goal.id}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Enter amount"
                                        value={addAmount}
                                        onChange={(e) => {
                                          const value = Math.max(0, parseFloat(e.target.value) || 0);
                                          setAddAmount(value.toString());
                                        }}
                                        className="bg-input/50 border-border/50 focus:border-primary flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddAmountToGoal(goal.id)}
                                        className="bg-gradient-to-r from-primary to-secondary px-3"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setAddingAmountToGoal(null);
                                          setAddAmount("");
                                        }}
                                        className="px-3"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="w-full bg-accent/20 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-primary to-tertiary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-foreground/50 mt-2">
                                Deadline: {new Date(goal.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recurring Transactions */}
              <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    Recurring Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recurringTransactions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-foreground/60 mb-4">Automate your regular expenses and income</p>
                      <Button 
                        className="bg-gradient-to-r from-secondary to-tertiary"
                        onClick={() => setShowAddRecurring(true)}
                      >
                        Add Recurring Transaction
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Recurring Transactions</h3>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-secondary to-tertiary"
                          onClick={() => setShowAddRecurring(true)}
                        >
                          Add Recurring
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {recurringTransactions.map((recurring) => (
                          <div key={recurring.id} className="glass p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h4 className="font-medium">{recurring.description}</h4>
                                <p className="text-sm text-foreground/60">
                                  {recurring.frequency} • Next: {new Date(recurring.nextDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${recurring.type === 'income' ? 'text-tertiary' : 'text-red-500'}`}>
                                  {recurring.type === 'income' ? '+' : '-'}₹{recurring.amount.toFixed(0)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRecurring(recurring.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Sidebar */}
      {showNotifications && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[150]" 
            onClick={() => setShowNotifications(false)}
          ></div>
          <div className="fixed right-0 top-0 h-full w-96 bg-background border-l-2 border-primary/30 z-[200] shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Notifications</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 glass rounded-lg border border-border/50">
                        <div className="flex items-start gap-3">
                          {notif.type === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <BellRing className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                            <p className="text-sm text-foreground/70 mb-2">{notif.message}</p>
                            <p className="text-xs text-foreground/50">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground/60">No notifications yet</p>
                    <p className="text-sm text-foreground/40 mt-2">We'll notify you about important updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass neon-border animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Add Financial Goal
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddGoal(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Amount (₹)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100000"
                  value={newGoal.targetAmount}
                  onChange={(e) => {
                    const value = Math.max(0, parseFloat(e.target.value) || 0);
                    setNewGoal({...newGoal, targetAmount: value.toString()});
                  }}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <div className="relative">
                  <Input
                    id="goal-deadline"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="bg-input/50 border-border/50 focus:border-primary pr-10 text-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                  <Calendar 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none z-10" 
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGoal}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  Add Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass neon-border animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Edit Financial Goal
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditGoal(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal-name">Goal Name</Label>
                <Input
                  id="edit-goal-name"
                  placeholder="e.g., Emergency Fund"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-goal-target">Target Amount (₹)</Label>
                <Input
                  id="edit-goal-target"
                  type="number"
                  step="0.01"
                  placeholder="100000"
                  value={editingGoal.targetAmount}
                  onChange={(e) => setEditingGoal({...editingGoal, targetAmount: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-goal-current">Current Amount (₹)</Label>
                <Input
                  id="edit-goal-current"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={editingGoal.currentAmount}
                  onChange={(e) => setEditingGoal({...editingGoal, currentAmount: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-goal-deadline">Deadline</Label>
                <Input
                  id="edit-goal-deadline"
                  type="date"
                  value={editingGoal.deadline}
                  onChange={(e) => setEditingGoal({...editingGoal, deadline: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditGoal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditGoal}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  Update Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Recurring Transaction Modal */}
      {showAddRecurring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass neon-border animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Add Recurring Transaction
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddRecurring(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurring-description">Description</Label>
                <Input
                  id="recurring-description"
                  placeholder="e.g., Netflix Subscription"
                  value={newRecurring.description}
                  onChange={(e) => setNewRecurring({...newRecurring, description: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newRecurring.type === "expense" ? "default" : "outline"}
                    className={newRecurring.type === "expense" ? "flex-1 bg-gradient-to-r from-secondary to-primary" : "flex-1"}
                    onClick={() => setNewRecurring({...newRecurring, type: "expense"})}
                  >
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant={newRecurring.type === "income" ? "default" : "outline"}
                    className={newRecurring.type === "income" ? "flex-1 bg-gradient-to-r from-tertiary to-primary" : "flex-1"}
                    onClick={() => setNewRecurring({...newRecurring, type: "income"})}
                  >
                    Income
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recurring-amount">Amount (₹)</Label>
                <Input
                  id="recurring-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="199"
                  value={newRecurring.amount}
                  onChange={(e) => {
                    const value = Math.max(0, parseFloat(e.target.value) || 0);
                    setNewRecurring({...newRecurring, amount: value.toString()});
                  }}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recurring-frequency">Frequency</Label>
                <Select 
                  value={newRecurring.frequency} 
                  onValueChange={(value) => setNewRecurring({...newRecurring, frequency: value})}
                >
                  <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="glass neon-border">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recurring-next-date">Next Date</Label>
                <div className="relative">
                  <Input
                    id="recurring-next-date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newRecurring.nextDate}
                    onChange={(e) => setNewRecurring({...newRecurring, nextDate: e.target.value})}
                    className="bg-input/50 border-border/50 focus:border-primary pr-10 text-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                  <Calendar 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none z-10" 
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddRecurring(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRecurring}
                  className="flex-1 bg-gradient-to-r from-secondary to-tertiary"
                >
                  Add Recurring
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass neon-border animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Add Investment
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddInvestment(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investment-name">Investment Name</Label>
                <Input
                  id="investment-name"
                  placeholder="e.g., HDFC Mutual Fund"
                  value={newInvestment.name}
                  onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="investment-type">Type</Label>
                <Select 
                  value={newInvestment.type} 
                  onValueChange={(value) => setNewInvestment({...newInvestment, type: value})}
                >
                  <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent className="glass neon-border">
                    <SelectItem value="mutual-fund">Mutual Fund</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="bonds">Bonds</SelectItem>
                    <SelectItem value="fd">Fixed Deposit</SelectItem>
                    <SelectItem value="ppf">PPF</SelectItem>
                    <SelectItem value="nps">NPS</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="investment-value">Current Value (₹)</Label>
                <Input
                  id="investment-value"
                  type="number"
                  step="0.01"
                  placeholder="10000"
                  value={newInvestment.value}
                  onChange={(e) => setNewInvestment({...newInvestment, value: e.target.value})}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddInvestment(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInvestment}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  Add Investment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Chatbot Side Panel */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <Card className="w-full max-w-sm sm:max-w-md h-full rounded-none rounded-l-2xl glass neon-border flex flex-col border-r-0 border-y-0 animate-in slide-in-from-right duration-300">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Financial Assistant
                </div>
                <div className="flex items-center gap-1">
                  {chatMessages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatMessages([])}
                      className="text-foreground/50 hover:text-red-400 h-8 w-8 p-0 rounded-full"
                      title="Clear Chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatbot(false)}
                    className="text-foreground/70 hover:text-foreground h-8 w-8 p-0 rounded-full"
                  >
                    ✕
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-foreground/60 py-12 mt-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Ask me anything about your finances!</p>
                    <p className="text-xs text-foreground/50 mt-2">I can analyze your spending and suggest budgets.</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-primary text-white rounded-br-none shadow-md'
                            : 'glass border border-border/50 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {msg.type === 'ai' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.message}</p>
                        )}
                        <p className={`text-[10px] mt-1.5 text-right ${msg.type === 'user' ? 'opacity-80' : 'opacity-50'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-3 border-t border-border/30 mt-auto">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="bg-input/50 border-border/50 focus:border-primary flex-1"
                  />
                  <Button type="submit" size="sm" className="bg-gradient-to-r from-primary to-secondary px-4 shadow-md">
                    Send
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
