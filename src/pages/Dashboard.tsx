import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, PlusCircle, TrendingDown, TrendingUp, Wallet, Trash2 } from "lucide-react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  useEffect(() => {
    const currentUser = localStorage.getItem("spendwise_current_user");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(currentUser);
    setUser(userData);
    
    // Load transactions for this user
    const savedTransactions = localStorage.getItem(`transactions_${userData.id}`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("spendwise_current_user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
    
    toast.success("Transaction added!");
    setDescription("");
    setAmount("");
    setCategory("");
  };

  const handleDeleteTransaction = (id: number) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
    toast.success("Transaction deleted");
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  if (!user) return null;

  return (
    <div className="min-h-screen p-6">
      {/* Navbar */}
      <nav className="glass neon-border rounded-2xl p-4 mb-6 animate-fade-in">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-tertiary rounded-xl flex items-center justify-center shadow-[var(--shadow-neon-blue)]">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                SpendWise AI
              </h1>
              <p className="text-xs text-foreground/60">Welcome, {user.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-border/50 hover:border-primary hover:bg-accent"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
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
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food, Transport, Salary"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
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

          {/* Transactions List */}
          <Card className="glass neon-border animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-foreground/50 text-center py-8">No transactions yet. Add your first one!</p>
                ) : (
                  transactions.map((transaction) => (
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
      </div>
    </div>
  );
};

export default Dashboard;
