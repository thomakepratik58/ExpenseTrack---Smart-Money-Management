import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { Wallet, Bell, Settings, Home, BarChart3, PlusCircle, ArrowUpRight, ArrowDownRight, Lightbulb, Target, CreditCard, Smartphone, MessageSquare, X } from 'lucide-react';

// --- Modal Component to Add Transaction ---
const AddTransactionModal = ({ onClose, onAddTransaction }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('debit');
  const [source, setSource] = useState('UPI');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !merchant) {
      alert("Please fill in all fields.");
      return;
    }

    const newTransaction = {
      amount: parseFloat(amount),
      category: type === 'credit' ? 'Income' : category,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      source,
      merchant,
      type,
    };

    onAddTransaction(newTransaction);
  };
  
  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => setType('debit')} className={`flex-1 p-2 rounded-lg text-sm font-semibold ${type === 'debit' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Expense</button>
              <button type="button" onClick={() => setType('credit')} className={`flex-1 p-2 rounded-lg text-sm font-semibold ${type === 'credit' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Income</button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (₹)</label>
            <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
          </div>

          <div>
            <label htmlFor="merchant" className="text-sm font-medium text-gray-700">{type === 'debit' ? 'Merchant' : 'Source'}</label>
            <input id="merchant" type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder={type === 'debit' ? 'e.g., Zomato' : 'e.g., Salary'} className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
          </div>

          {type === 'debit' && (
            <div>
              <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main App Component ---
const ExpenseTrackerApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use localStorage to persist expenses
  const [expenses, setExpenses] = useState(() => {
    try {
      const localData = localStorage.getItem('expenses');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse expenses from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);
  
  const [budget] = useState({
    total: 5000,
    Food: 2000,
    Transport: 800,
    Entertainment: 500,
    Bills: 1000,
    Other: 700
  });

  const [notifications] = useState([
    { id: 1, title: 'High Spending Alert', message: 'Food expenses 15% above budget', time: '2h ago', type: 'warning' },
    { id: 2, title: 'New Transaction', message: '₹250 spent at Zomato', time: '5h ago', type: 'info' },
    { id: 3, title: 'Saving Tip', message: 'Switch to metro to save ₹500/month', time: '1d ago', type: 'success' }
  ]);
  
  const addTransaction = (newTx) => {
    setExpenses(prevExpenses => [...prevExpenses, { ...newTx, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const calculateData = () => {
    const totalSpent = expenses.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
    
    const categoryTotals = expenses
      .filter(e => e.type === 'debit')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    
    // Process data for the line chart
    const dailySpending = expenses
      .filter(e => e.type === 'debit')
      .reduce((acc, e) => {
        const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + e.amount;
        return acc;
      }, {});
      
    const lineChartData = Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { totalSpent, totalIncome, categoryTotals, pieData, lineChartData };
  };

  const { totalSpent, totalIncome, categoryTotals, pieData, lineChartData } = calculateData();
  const balance = totalIncome - totalSpent;

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  const HomeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
          <Wallet className="w-6 h-6 opacity-80 mb-3" />
          <div className="text-2xl font-bold">₹{balance.toFixed(2)}</div>
          <div className="text-sm opacity-90 mt-1">Balance</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-5 text-white shadow-lg">
          <ArrowUpRight className="w-6 h-6 opacity-80 mb-3" />
          <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
          <div className="text-sm opacity-90 mt-1">Spent</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-white shadow-lg">
          <ArrowDownRight className="w-6 h-6 opacity-80 mb-3" />
          <div className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
          <div className="text-sm opacity-90 mt-1">Income</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Budget Overview</h3>
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <div className="space-y-4">
          {Object.entries(budget).filter(([key]) => key !== 'total').map(([category, limit]) => {
            const spent = categoryTotals[category] || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const color = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize font-medium text-gray-700">{category}</span>
                  <span className="text-gray-600">₹{spent.toFixed(0)} / ₹{limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No transactions yet. Add one!</p>
          ) : (
            [...expenses].reverse().slice(0, 5).map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${exp.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {exp.source === 'UPI' ? <Smartphone className="w-4 h-4 text-gray-700" /> : <CreditCard className="w-4 h-4 text-gray-700" />}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{exp.merchant}</div>
                    <div className="text-xs text-gray-500">{exp.category} • {exp.date}</div>
                  </div>
                </div>
                <div className={`font-bold ${exp.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {exp.type === 'credit' ? '+' : '-'}₹{exp.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const AnalyticsDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Category</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-gray-500 py-10">No spending data to display.</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Spending Trend</h3>
        {lineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-gray-500 py-10">No spending data for trend chart.</p>}
      </div>
    </div>
  );

  const NotificationsView = () => (
    // This remains static as per original design
     <div className="space-y-4">
      {notifications.map(notif => (
        <div key={notif.id} className={`rounded-2xl p-5 shadow-md ${
          notif.type === 'warning' ? 'bg-red-50 border border-red-200' :
          notif.type === 'success' ? 'bg-green-50 border border-green-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              notif.type === 'warning' ? 'bg-red-200' :
              notif.type === 'success' ? 'bg-green-200' :
              'bg-blue-200'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{notif.title}</div>
              <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
              <div className="text-xs text-gray-500 mt-2">{notif.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} onAddTransaction={addTransaction} />}
      
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ExpenseTrack</h1>
              <p className="text-xs text-gray-500 mt-1">Smart money management</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"><MessageSquare className="w-5 h-5 text-purple-600" /></button>
              <button className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"><Settings className="w-5 h-5 text-purple-600" /></button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 py-6 pb-24">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'notifications' && <NotificationsView />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-3">
          <div className="flex items-center justify-around">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center gap-1 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg -mt-6 transform hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8 text-white" />
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'notifications' ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}>
              <Bell className="w-6 h-6" />
              <span className="text-xs font-medium">Alerts</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-400">
              <Wallet className="w-6 h-6" />
              <span className="text-xs font-medium">Wallet</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpenseTrackerApp;
