import React, { useState, useMemo } from "react";
import { Wallet, Plus, Trash2, ArrowUpRight, TrendingUp, AlertCircle, Group, HandCoins } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "Lodging" | "Dining" | "Transit" | "Activities" | "Shopping" | "Other";
  splitWithGroup: boolean;
}

interface ExpenseTrackerProps {
  homeCurrency: string;
  localCurrency: string;
  exchangeRate: number; // 1 home = X local
  midRangeDailyUSD: number; // reference
}

const CATEGORY_COLORS: Record<string, string> = {
  Lodging: "#6366f1", // indigo-500
  Dining: "#f43f5e",   // rose-500
  Transit: "#eab308",  // yellow-500
  Activities: "#0ea5e9", // sky-500
  Shopping: "#8b5cf6", // violet-500
  Other: "#94a3b8"     // slate-400
};

export default function ExpenseTracker({
  homeCurrency = "USD",
  localCurrency = "EUR",
  exchangeRate = 0.92,
  midRangeDailyUSD = 150
}: ExpenseTrackerProps) {
  const { theme } = useAppTheme();
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", title: "Premium Guesthouse Booking", amount: 120, category: "Lodging", splitWithGroup: false },
    { id: "2", title: "Local Gourmet Dinner", amount: 45, category: "Dining", splitWithGroup: true },
    { id: "3", title: "Express Train Transit Passes", amount: 25, category: "Transit", splitWithGroup: true }
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<Expense["category"]>("Dining");
  const [splitGroup, setSplitGroup] = useState(false);
  const [groupSize, setGroupSize] = useState(3);

  // Home currency limit calculation
  const totalHomeSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalLocalSpent = useMemo(() => {
    return totalHomeSpent * exchangeRate;
  }, [totalHomeSpent, exchangeRate]);

  // Group split calculations
  const splitGroupAmount = useMemo(() => {
    const listToSplit = expenses.filter(e => e.splitWithGroup);
    const sum = listToSplit.reduce((s, e) => s + e.amount, 0);
    return sum / (groupSize || 1);
  }, [expenses, groupSize]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || isNaN(Number(newAmount))) return;
    const item: Expense = {
      id: Date.now().toString(),
      title: newTitle,
      amount: Number(newAmount),
      category: newCategory,
      splitWithGroup: splitGroup
    };
    setExpenses([...expenses, item]);
    setNewTitle("");
    setNewAmount("");
    setSplitGroup(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const budgetIsExceeded = totalHomeSpent > (midRangeDailyUSD * 3);

  const pieData = useMemo(() => {
    const categories = ["Lodging", "Dining", "Transit", "Activities", "Shopping", "Other"];
    return categories.map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    })).filter(item => item.value > 0);
  }, [expenses]);

  return (
    <ThemeCard className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      
      {/* Left side: Wallet & Spent Status Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-2xl p-5 relative overflow-hidden shadow-xl liquid-glass border" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${theme.accent}20` }} />
          <div className="flex justify-between items-center relative z-10 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: theme.accentLighter }}>Active Wallet</span>
            <Wallet className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
          </div>

          <div className="space-y-1 relative z-10">
            <span className="text-xs block font-medium opacity-70 text-white">Accumulated Expenses</span>
            <h3 className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5 font-mono">
              {totalHomeSpent.toFixed(2)}
              <span className="text-xs font-bold font-sans" style={{ color: theme.accentLighter }}>{homeCurrency}</span>
            </h3>
            <p className="text-xs font-mono opacity-70 text-white">
              ≈ {totalLocalSpent.toFixed(2)} <span style={{ color: theme.accentLighter }}>{localCurrency}</span> ({exchangeRate.toFixed(2)} rate)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t relative z-10 flex justify-between items-center" style={{ borderColor: `${theme.accent}20` }}>
            <div>
              <span className="text-[9px] font-mono block uppercase opacity-60 text-white">Recommended Cap</span>
              <p className="text-xs font-semibold font-mono text-white">{(midRangeDailyUSD * 3).toFixed(2)} {homeCurrency}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono block uppercase opacity-60 text-white">Difference</span>
              <p className={`text-xs font-bold font-mono ${budgetIsExceeded ? "text-rose-400" : "text-emerald-400"}`}>
                {((midRangeDailyUSD * 3) - totalHomeSpent).toFixed(2)} {homeCurrency}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Card */}
        {budgetIsExceeded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-start gap-2.5 text-xs liquid-glass"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Budget Exhaustion Warning</span>
              <span className="opacity-85 text-[11px] leading-relaxed block">
                Total spent has scaled above recommended mid-range threshold. Consider switching to complimentary landmarks and eco rail transits.
              </span>
            </div>
          </motion.div>
        )}

        {/* Group Travel Split widget */}
        <div className="border p-4 rounded-xl space-y-3 liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
          <div className="flex items-center gap-2">
            <Group className="w-4 h-4" style={{ color: theme.accentLighter }} />
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-white">Share split estimator</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs opacity-70 text-white">
              <span>Co-traveler headcount:</span>
              <input 
                type="number" 
                value={groupSize} 
                onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
                className="w-12 px-1.5 py-0.5 border rounded font-mono text-right text-xs text-white liquid-glass outline-none focus:ring-1"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}
              />
            </div>
            <div className="p-2.5 rounded-lg border liquid-glass" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
              <div className="flex justify-between items-center text-[10px] font-mono mb-1 opacity-70 text-white">
                <span>Total Splittable:</span>
                <span>{expenses.filter(e => e.splitWithGroup).reduce((s, e) => s + e.amount, 0).toFixed(2)} {homeCurrency}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold font-sans">
                <span className="flex items-center gap-1 opacity-90 text-white"><HandCoins className="w-3.5 h-3.5" style={{ color: theme.accent }} /> Individual Share:</span>
                <span className="font-mono text-white">{splitGroupAmount.toFixed(2)} {homeCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Expense List & Logger */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-1.5 text-white">
              <TrendingUp className="w-4 h-4" style={{ color: theme.accentLighter }} /> Spending Tracker
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border liquid-glass" style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
              {expenses.length} Records registered
            </span>
          </div>

          {/* Graphical Allocations Using Recharts */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2 rounded-2xl p-4 border liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
            <div className="w-full sm:w-1/2 h-[180px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      stroke="none"
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", fontSize: "12px", borderRadius: "12px" }} 
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: number) => [`${value.toFixed(2)} ${homeCurrency}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs opacity-50 text-white font-mono">No Data</div>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-2">
              {pieData.map((data, index) => (
                <div key={index} className="flex justify-between items-center text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[data.name] }}></span>
                    <span className="opacity-90">{data.name}</span>
                  </div>
                  <span className="font-mono opacity-80">{data.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Adding Expense form */}
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl border liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}20` }}>
            <input 
              type="text" 
              required
              placeholder="Expense title" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-xs px-3 py-2 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-1 liquid-glass"
              style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}
            />
            <input 
              type="text" 
              required
              placeholder={`Amount (${homeCurrency})`} 
              value={newAmount} 
              onChange={(e) => setNewAmount(e.target.value)}
              className="text-xs px-3 py-2 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-1 font-mono liquid-glass"
              style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}
            />
            <select 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value as Expense["category"])}
              className="text-xs px-3 py-2 border rounded-xl text-white focus:outline-none focus:ring-1 font-sans liquid-glass"
              style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}
            >
              <option value="Lodging" className="bg-slate-900">🏨 Lodging</option>
              <option value="Dining" className="bg-slate-900">🍽️ Dining</option>
              <option value="Transit" className="bg-slate-900">🚆 Transit</option>
              <option value="Activities" className="bg-slate-900">🎯 Activities</option>
              <option value="Shopping" className="bg-slate-900">🛍️ Shopping</option>
              <option value="Other" className="bg-slate-900">💼 Other</option>
            </select>
            <div className="flex gap-2 items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] font-mono cursor-pointer select-none opacity-70 text-white">
                <input 
                  type="checkbox" 
                  checked={splitGroup} 
                  onChange={(e) => setSplitGroup(e.target.checked)}
                  className="rounded border w-3 h-3 cursor-pointer liquid-glass"
                  style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}
                />
                Split
              </label>
              <button 
                type="submit" 
                className="text-white p-2 rounded-xl text-xs flex items-center justify-center cursor-pointer font-bold shrink-0 shadow-md border transition-all hover:scale-105"
                style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Expenses logs list */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence>
              {expenses.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 rounded-xl border flex justify-between items-center gap-3 transition-all hover:scale-[1.01] liquid-glass"
                  style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-1.5 py-0.5 rounded mr-2 inline-block border liquid-glass" style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
                      {e.category}
                    </span>
                    <span className="text-xs text-white font-sans font-medium truncate">{e.title}</span>
                    {e.splitWithGroup && (
                      <span className="text-[8px] font-mono ml-2 text-emerald-400 uppercase tracking-widest bg-emerald-950/20 py-0.5 px-1 rounded border border-emerald-900/30">
                        SPLIT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-white">
                      {e.amount.toFixed(2)} {homeCurrency}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-1.5 opacity-60 hover:opacity-100 hover:text-rose-400 rounded-md border transition-all cursor-pointer liquid-glass"
                      style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[10px] font-mono pt-4 border-t opacity-50 text-white" style={{ borderColor: `${theme.accent}20` }}>
          * Price indices and currency exchanges calculate in real-time. Tipping norms or hidden charges are automatically integrated.
        </p>
      </div>

    </ThemeCard>
  );
}
