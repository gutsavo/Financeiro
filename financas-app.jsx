import React, { useState } from "react";
import {
  Wallet, Receipt, Target, LayoutGrid, Plus, Check,
  AlertCircle, Layers
} from "lucide-react";

const INK = "#1F2E2B";
const PAPER = "#FAF6EC";
const RULE = "#D8CFB8";
const GREEN = "#2F5233";
const RED = "#A5433A";
const GOLD = "#9C7A2E";

const initialExpenses = [
  { id: 1, desc: "Mercado", cat: "Alimentação", value: 187.4, date: "08/07" },
  { id: 2, desc: "Uber", cat: "Transporte", value: 24.9, date: "08/07" },
  { id: 3, desc: "Farmácia", cat: "Saúde", value: 63.2, date: "09/07" },
  { id: 4, desc: "Restaurante", cat: "Alimentação", value: 58.0, date: "09/07" },
];

const initialBills = [
  { id: 1, desc: "Aluguel", value: 950, due: "15/07", paid: false },
  { id: 2, desc: "Internet", value: 99.9, due: "12/07", paid: false },
  { id: 3, desc: "Cartão de crédito", value: 430.5, due: "10/07", paid: true },
  { id: 4, desc: "Academia", value: 89.9, due: "20/07", paid: false },
];

const initialGoals = [
  { id: 1, name: "Reserva de emergência", target: 5000, saved: 2100 },
  { id: 2, name: "Viagem", target: 1800, saved: 450 },
];

const initialInstallments = [
  { id: 1, desc: "Notebook", total: 3600, count: 12, current: 4 },
  { id: 2, desc: "Sofá", total: 1200, count: 6, current: 2 },
];

function money(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcSaldoInicial() {
  const rendaInicial = 4000; // mock: dinheiro que entrou na conta
  const gastos = initialExpenses.reduce((s, e) => s + e.value, 0);
  const contasPagas = initialBills.filter(b => b.paid).reduce((s, b) => s + b.value, 0);
  const parcelasJaPagas = initialInstallments.reduce(
    (s, i) => s + (i.current - 1) * (i.total / i.count), 0
  );
  return rendaInicial - gastos - contasPagas - parcelasJaPagas;
}

export default function App() {
  const [tab, setTab] = useState("resumo");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [bills, setBills] = useState(initialBills);
  const [goals, setGoals] = useState(initialGoals);
  const [installments, setInstallments] = useState(initialInstallments);
  const [saldo, setSaldo] = useState(calcSaldoInicial);
  const [editingSaldo, setEditingSaldo] = useState(false);
  const [saldoInput, setSaldoInput] = useState("");

  const [newDesc, setNewDesc] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installCount, setInstallCount] = useState("");

  const activeInstallments = installments.filter(i => i.current <= i.count);
  const totalExpensesMonth = expenses.reduce((s, e) => s + e.value, 0);

  function addExpense() {
    if (!newDesc || !newValue) return;
    const value = parseFloat(newValue);

    if (isInstallment && installCount) {
      const count = parseInt(installCount, 10);
      setInstallments([
        { id: Date.now(), desc: newDesc, total: value, count, current: 1 },
        ...installments,
      ]);
      setSaldo(s => s - value / count); // paga a 1ª parcela na hora
    } else {
      setExpenses([
        { id: Date.now(), desc: newDesc, cat: "Outros", value, date: "hoje" },
        ...expenses,
      ]);
      setSaldo(s => s - value);
    }
    setNewDesc("");
    setNewValue("");
    setInstallCount("");
    setIsInstallment(false);
  }

  function toggleBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    setSaldo(s => (bill.paid ? s + bill.value : s - bill.value));
    setBills(bills.map(b => (b.id === id ? { ...b, paid: !b.paid } : b)));
  }

  function advanceInstallment(id) {
    const inst = installments.find(i => i.id === id);
    if (!inst || inst.current > inst.count) return;
    setSaldo(s => s - inst.total / inst.count);
    setInstallments(installments.map(i => (i.id === id ? { ...i, current: i.current + 1 } : i)));
  }

  function saveSaldo() {
    const v = parseFloat(saldoInput.replace(",", "."));
    if (!isNaN(v)) setSaldo(v);
    setEditingSaldo(false);
    setSaldoInput("");
  }

  return (
    <div
      style={{ background: PAPER, color: INK, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
      className="min-h-screen max-w-md mx-auto flex flex-col"
    >
      <header className="px-5 pt-6 pb-4" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg tracking-wide" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Livro-caixa
          </h1>
          <span className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>Julho 2026</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Saldo em conta</p>
            {editingSaldo ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  autoFocus
                  value={saldoInput}
                  onChange={e => setSaldoInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveSaldo()}
                  placeholder={saldo.toFixed(2)}
                  type="number"
                  className="w-32 text-lg px-2 py-1 bg-transparent outline-none"
                  style={{ border: `1px solid ${INK}`, fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <button onClick={saveSaldo} className="text-xs px-2 py-1" style={{ background: INK, color: PAPER }}>
                  ok
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingSaldo(true); setSaldoInput(saldo.toFixed(2)); }}
                className="text-3xl font-semibold tabular-nums text-left"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: saldo >= 0 ? GREEN : RED }}
              >
                {money(saldo)}
              </button>
            )}
          </div>
          <div className="text-right text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <p style={{ color: RED }}>gastos: {money(totalExpensesMonth)}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 pb-24">
        {tab === "resumo" && (
          <Resumo expenses={expenses} bills={bills} goals={goals} installments={activeInstallments} />
        )}
        {tab === "gastos" && (
          <Gastos
            expenses={expenses}
            installments={installments}
            newDesc={newDesc}
            newValue={newValue}
            setNewDesc={setNewDesc}
            setNewValue={setNewValue}
            isInstallment={isInstallment}
            setIsInstallment={setIsInstallment}
            installCount={installCount}
            setInstallCount={setInstallCount}
            addExpense={addExpense}
            advanceInstallment={advanceInstallment}
          />
        )}
        {tab === "contas" && <Contas bills={bills} toggleBill={toggleBill} />}
        {tab === "metas" && <Metas goals={goals} />}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around py-2"
        style={{ background: PAPER, borderTop: `2px solid ${INK}` }}
      >
        <TabButton icon={LayoutGrid} label="Resumo" active={tab === "resumo"} onClick={() => setTab("resumo")} />
        <TabButton icon={Receipt} label="Gastos" active={tab === "gastos"} onClick={() => setTab("gastos")} />
        <TabButton icon={Wallet} label="Contas" active={tab === "contas"} onClick={() => setTab("contas")} />
        <TabButton icon={Target} label="Metas" active={tab === "metas"} onClick={() => setTab("metas")} />
      </nav>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-1" style={{ color: active ? INK : "#9A9182" }}>
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </button>
  );
}

function Row({ left, mid, right, color }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px dotted ${RULE}` }}>
      <div className="flex flex-col">
        <span className="text-sm">{left}</span>
        {mid && <span className="text-[11px] opacity-50">{mid}</span>}
      </div>
      <span className="text-sm tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace", color: color || INK }}>
        {right}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD }}>
      {children}
    </h2>
  );
}

function Resumo({ expenses, bills, goals, installments }) {
  const pendingBills = bills.filter(b => !b.paid);
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Últimos gastos</SectionTitle>
        {expenses.slice(0, 4).map(e => (
          <Row key={e.id} left={e.desc} mid={e.cat} right={money(e.value)} color={RED} />
        ))}
      </div>

      {installments.length > 0 && (
        <div>
          <SectionTitle>Parceladas ativas este mês</SectionTitle>
          {installments.map(i => (
            <Row
              key={i.id}
              left={i.desc}
              mid={`parcela ${i.current}/${i.count}`}
              right={money(i.total / i.count)}
              color={GOLD}
            />
          ))}
        </div>
      )}

      <div>
        <SectionTitle>Contas a vencer</SectionTitle>
        {pendingBills.length === 0 && <p className="text-sm opacity-60">Tudo pago. Nada pendente.</p>}
        {pendingBills.map(b => (
          <Row key={b.id} left={b.desc} mid={`vence ${b.due}`} right={money(b.value)} color={GOLD} />
        ))}
      </div>
      <div>
        <SectionTitle>Metas</SectionTitle>
        {goals.map(g => (
          <div key={g.id} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>{g.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {money(g.saved)} / {money(g.target)}
              </span>
            </div>
            <div className="h-2 w-full" style={{ background: RULE }}>
              <div
                className="h-2"
                style={{ width: `${Math.min(100, (g.saved / g.target) * 100)}%`, background: GREEN }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gastos({
  expenses, installments, newDesc, newValue, setNewDesc, setNewValue,
  isInstallment, setIsInstallment, installCount, setInstallCount,
  addExpense, advanceInstallment,
}) {
  const total = expenses.reduce((s, e) => s + e.value, 0);
  const perParcela = isInstallment && newValue && installCount
    ? parseFloat(newValue) / parseInt(installCount, 10)
    : null;

  return (
    <div>
      <SectionTitle>Novo gasto</SectionTitle>
      <div className="flex gap-2 mb-2">
        <input
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          placeholder="Descrição"
          className="flex-1 text-sm px-2 py-1.5 bg-transparent outline-none"
          style={{ border: `1px solid ${RULE}` }}
        />
        <input
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder={isInstallment ? "Total R$" : "R$"}
          type="number"
          className="w-24 text-sm px-2 py-1.5 bg-transparent outline-none"
          style={{ border: `1px solid ${RULE}`, fontFamily: "'IBM Plex Mono', monospace" }}
        />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsInstallment(!isInstallment)}
          className="flex items-center gap-1.5 text-xs px-2 py-1"
          style={{ border: `1px solid ${isInstallment ? GOLD : RULE}`, color: isInstallment ? GOLD : INK }}
        >
          <Layers size={13} />
          Compra parcelada
        </button>
        {isInstallment && (
          <input
            value={installCount}
            onChange={e => setInstallCount(e.target.value)}
            placeholder="nº parcelas"
            type="number"
            className="w-24 text-xs px-2 py-1.5 bg-transparent outline-none"
            style={{ border: `1px solid ${RULE}`, fontFamily: "'IBM Plex Mono', monospace" }}
          />
        )}
      </div>

      {isInstallment && perParcela && (
        <p className="text-xs mb-2 opacity-70">
          {installCount}x de <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: GOLD }}>{money(perParcela)}</span>
        </p>
      )}

      <button onClick={addExpense} className="w-full flex items-center justify-center gap-1 text-sm py-2 mb-4" style={{ background: INK, color: PAPER }}>
        <Plus size={15} /> Adicionar
      </button>

      {installments.length > 0 && (
        <>
          <SectionTitle>Compras parceladas</SectionTitle>
          {installments.map(i => {
            const done = i.current > i.count;
            const pct = Math.min(100, ((i.current - 1) / i.count) * 100);
            return (
              <div key={i.id} className="mb-3 pb-2" style={{ borderBottom: `1px dotted ${RULE}` }}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm">{i.desc}</span>
                  <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: done ? GREEN : GOLD }}>
                    {done ? "quitado" : `${money(i.total / i.count)} /mês`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1" style={{ background: RULE }}>
                    <div className="h-1.5" style={{ width: `${pct}%`, background: done ? GREEN : GOLD }} />
                  </div>
                  <span className="text-[11px] opacity-60 whitespace-nowrap">
                    {done ? `${i.count}/${i.count}` : `${i.current}/${i.count}`}
                  </span>
                  {!done && (
                    <button onClick={() => advanceInstallment(i.id)} className="text-[11px] underline opacity-70">
                      pagar parcela
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      <SectionTitle>Todos os gastos</SectionTitle>
      {expenses.map(e => (
        <Row key={e.id} left={e.desc} mid={`${e.cat} · ${e.date}`} right={money(e.value)} color={RED} />
      ))}
      <div className="flex justify-between pt-3 mt-2 text-sm font-semibold" style={{ borderTop: `2px solid ${INK}` }}>
        <span>Total</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: RED }}>{money(total)}</span>
      </div>
    </div>
  );
}

function Contas({ bills, toggleBill }) {
  return (
    <div>
      <SectionTitle>Contas do mês</SectionTitle>
      {bills.map(b => (
        <div key={b.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px dotted ${RULE}` }}>
          <button onClick={() => toggleBill(b.id)} className="flex items-center gap-2">
            <span
              className="w-5 h-5 flex items-center justify-center"
              style={{ border: `1.5px solid ${b.paid ? GREEN : RULE}`, background: b.paid ? GREEN : "transparent" }}
            >
              {b.paid && <Check size={13} color={PAPER} />}
            </span>
            <div className="text-left">
              <p className="text-sm" style={{ textDecoration: b.paid ? "line-through" : "none", opacity: b.paid ? 0.5 : 1 }}>
                {b.desc}
              </p>
              <p className="text-[11px] opacity-50 flex items-center gap-1">
                {!b.paid && <AlertCircle size={11} />} vence {b.due}
              </p>
            </div>
          </button>
          <span className="text-sm tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace", color: b.paid ? GREEN : GOLD }}>
            {money(b.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Metas({ goals }) {
  return (
    <div>
      <SectionTitle>Metas de economia</SectionTitle>
      {goals.map(g => {
        const pct = Math.min(100, (g.saved / g.target) * 100);
        return (
          <div key={g.id} className="mb-5 pb-4" style={{ borderBottom: `1px dotted ${RULE}` }}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium">{g.name}</span>
              <span className="text-xs" style={{ color: GREEN }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full mb-1" style={{ background: RULE }}>
              <div className="h-2.5" style={{ width: `${pct}%`, background: GREEN }} />
            </div>
            <p className="text-xs tabular-nums opacity-70" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {money(g.saved)} de {money(g.target)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
