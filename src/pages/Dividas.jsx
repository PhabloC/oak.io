import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function Dividas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dividas, setDividas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDivida, setEditingDivida] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dividaToDelete, setDividaToDelete] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [dividaToPay, setDividaToPay] = useState(null);
  const [payValue, setPayValue] = useState("");
  const [activeTab, setActiveTab] = useState("pendentes");
  const [showQuitarModal, setShowQuitarModal] = useState(false);
  const [dividaToQuitar, setDividaToQuitar] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    totalValue: "",
    paidValue: "",
    dueDate: "",
    creditor: "",
    category: "Cartão de Crédito",
    description: "",
  });

  const categories = [
    "Cartão de Crédito",
    "Empréstimo",
    "Financiamento",
    "Conta de Consumo",
    "Aluguel",
    "Parcelamento",
    "Outros",
  ];

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/transacoes" ||
    location.pathname === "/metas" ||
    location.pathname === "/dividas";

  useEffect(() => {
    const checkAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      await loadDividas(user.id);
    };

    checkAndLoad();
  }, [navigate]);

  const loadDividas = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("dividas")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Erro ao carregar dívidas:", error);
        return;
      }

      setDividas(data || []);
    } catch (error) {
      console.error("Erro ao carregar dívidas:", error);
    }
  };

  const formatInputCurrency = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const number = parseInt(numericValue, 10) / 100;
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyToNumber = (value) => {
    if (!value) return 0;
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const handleCurrencyChange = (field, value) => {
    const formatted = formatInputCurrency(value);
    setFormData({ ...formData, [field]: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    const dividaData = {
      title: formData.title,
      total_value: parseCurrencyToNumber(formData.totalValue),
      paid_value: parseCurrencyToNumber(formData.paidValue) || 0,
      due_date: formData.dueDate || null,
      creditor: formData.creditor || null,
      category: formData.category,
      description: formData.description || null,
      user_id: user.id,
    };

    try {
      if (editingDivida) {
        const { error } = await supabase
          .from("dividas")
          .update(dividaData)
          .eq("id", editingDivida.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setDividas((prev) =>
          prev.map((d) =>
            d.id === editingDivida.id ? { ...d, ...dividaData } : d,
          ),
        );
        setSuccessMessage("Dívida atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("dividas")
          .insert([dividaData])
          .select()
          .single();

        if (error) throw error;

        setDividas((prev) => [...prev, data]);
        setSuccessMessage("Dívida cadastrada com sucesso!");
      }

      handleCloseModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar dívida:", error);
    }
  };

  const handleEdit = (divida) => {
    setEditingDivida(divida);
    setFormData({
      title: divida.title,
      totalValue: divida.total_value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      paidValue: divida.paid_value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      dueDate: divida.due_date || "",
      creditor: divida.creditor || "",
      category: divida.category,
      description: divida.description || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDivida(null);
    setFormData({
      title: "",
      totalValue: "",
      paidValue: "",
      dueDate: "",
      creditor: "",
      category: "Cartão de Crédito",
      description: "",
    });
  };

  const handleOpenDeleteModal = (divida) => {
    setDividaToDelete(divida);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDividaToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!dividaToDelete) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { error } = await supabase
        .from("dividas")
        .delete()
        .eq("id", dividaToDelete.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDividas((prev) => prev.filter((d) => d.id !== dividaToDelete.id));
      setSuccessMessage("Dívida excluída com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erro ao excluir dívida:", error);
    }
  };

  const handleOpenPayModal = (divida) => {
    setDividaToPay(divida);
    setPayValue("");
    setShowPayModal(true);
  };

  const handleClosePayModal = () => {
    setDividaToPay(null);
    setPayValue("");
    setShowPayModal(false);
  };

  const handlePayDivida = async () => {
    if (!dividaToPay || !payValue) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const valueToAdd = parseCurrencyToNumber(payValue);
    if (isNaN(valueToAdd) || valueToAdd <= 0) return;

    const newPaidValue = dividaToPay.paid_value + valueToAdd;
    const isPaid = newPaidValue >= dividaToPay.total_value;

    try {
      const { error } = await supabase
        .from("dividas")
        .update({
          paid_value: newPaidValue,
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : null,
        })
        .eq("id", dividaToPay.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDividas((prev) =>
        prev.map((d) =>
          d.id === dividaToPay.id
            ? {
                ...d,
                paid_value: newPaidValue,
                is_paid: isPaid,
                paid_at: isPaid ? new Date().toISOString() : null,
              }
            : d,
        ),
      );
      setSuccessMessage(
        isPaid
          ? "Dívida quitada!"
          : `R$ ${valueToAdd.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pago!`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      handleClosePayModal();
    } catch (error) {
      console.error("Erro ao pagar dívida:", error);
    }
  };

  const handleOpenQuitarModal = (divida) => {
    setDividaToQuitar(divida);
    setShowQuitarModal(true);
  };

  const handleCloseQuitarModal = () => {
    setDividaToQuitar(null);
    setShowQuitarModal(false);
  };

  const handleQuitarDivida = async () => {
    if (!dividaToQuitar) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { error } = await supabase
        .from("dividas")
        .update({
          paid_value: dividaToQuitar.total_value,
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq("id", dividaToQuitar.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDividas((prev) =>
        prev.map((d) =>
          d.id === dividaToQuitar.id
            ? {
                ...d,
                paid_value: dividaToQuitar.total_value,
                is_paid: true,
                paid_at: new Date().toISOString(),
              }
            : d,
        ),
      );
      setSuccessMessage("Dívida quitada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseQuitarModal();
    } catch (error) {
      console.error("Erro ao quitar dívida:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sem vencimento";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getProgress = (paid, total) => {
    if (total === 0) return 0;
    const progress = (paid / total) * 100;
    return Math.min(progress, 100);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const dividasPendentes = useMemo(
    () => dividas.filter((d) => !d.is_paid),
    [dividas],
  );

  const dividasQuitadas = useMemo(
    () => dividas.filter((d) => d.is_paid),
    [dividas],
  );

  const currentDividas =
    activeTab === "pendentes" ? dividasPendentes : dividasQuitadas;

  const totals = useMemo(() => {
    const totalDividas = dividas.reduce((acc, d) => acc + d.total_value, 0);
    const totalPago = dividas.reduce((acc, d) => acc + d.paid_value, 0);
    const totalRestante = totalDividas - totalPago;
    const totalPendente = dividasPendentes.reduce(
      (acc, d) => acc + (d.total_value - d.paid_value),
      0,
    );
    return { totalDividas, totalPago, totalRestante, totalPendente };
  }, [dividas, dividasPendentes]);

  return (
    <div className="text-white flex min-h-screen">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <div className="p-4 ml-28 mt-4 flex flex-col pb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Controle de Dívidas</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition duration-300"
            >
              <FaPlus className="text-lg" />
              <span>Nova Dívida</span>
            </button>
          </div>

          {successMessage && (
            <div className="bg-green-600 text-white p-2 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-red-500/30 border border-red-400/20">
              <h3 className="text-lg font-semibold text-white mb-2 opacity-90">
                Total de Dívidas
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totals.totalDividas)}
              </p>
              <p className="text-sm text-red-200 mt-1">
                {dividas.length} dívida(s) cadastrada(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-orange-500/30 border border-orange-400/20">
              <h3 className="text-lg font-semibold text-white mb-2 opacity-90">
                Restante a Pagar
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totals.totalPendente)}
              </p>
              <p className="text-sm text-orange-200 mt-1">
                {dividasPendentes.length} dívida(s) pendente(s)
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-emerald-500/30 border border-emerald-400/20">
              <h3 className="text-lg font-semibold text-white mb-2 opacity-90">
                Total Pago
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totals.totalPago)}
              </p>
              <p className="text-sm text-emerald-200 mt-1">
                {dividasQuitadas.length} dívida(s) quitada(s)
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("pendentes")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "pendentes"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Pendentes ({dividasPendentes.length})
            </button>
            <button
              onClick={() => setActiveTab("quitadas")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "quitadas"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FaCheck className="text-sm" />
              Quitadas ({dividasQuitadas.length})
            </button>
          </div>

          {currentDividas.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-8 rounded-xl border border-indigo-500/20 text-center">
              <p className="text-gray-400 text-lg">
                {activeTab === "pendentes"
                  ? "Você não tem dívidas pendentes."
                  : "Você ainda não quitou nenhuma dívida."}
              </p>
              <p className="text-gray-500 mt-2">
                {activeTab === "pendentes"
                  ? 'Clique em "Nova Dívida" para cadastrar uma dívida.'
                  : "Continue pagando suas dívidas para vê-las aqui!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDividas.map((divida) => {
                const progress = getProgress(
                  divida.paid_value,
                  divida.total_value,
                );
                const remaining = divida.total_value - divida.paid_value;
                const overdue = isOverdue(divida.due_date) && !divida.is_paid;

                return (
                  <div
                    key={divida.id}
                    className={`bg-gradient-to-br ${
                      divida.is_paid
                        ? "from-emerald-900/30 via-emerald-800/20 to-emerald-900/30 border-emerald-500/30"
                        : overdue
                          ? "from-red-900/30 via-red-800/20 to-red-900/30 border-red-500/30"
                          : "from-gray-800/40 via-gray-800/30 to-gray-800/40 border-indigo-500/20"
                    } backdrop-blur-md p-6 rounded-xl border shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-600/30 text-indigo-300">
                            {divida.category}
                          </span>
                          {divida.is_paid && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center gap-1">
                              <FaCheck className="text-xs" />
                              Quitada
                            </span>
                          )}
                          {overdue && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-600/30 text-red-300">
                              Vencida
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mt-2">
                          {divida.title}
                        </h3>
                        {divida.creditor && (
                          <p className="text-sm text-gray-400 mt-1">
                            {divida.creditor}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!divida.is_paid && (
                          <>
                            <button
                              onClick={() => handleOpenPayModal(divida)}
                              className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 transition-colors"
                              title="Pagar parcela"
                            >
                              <FaMoneyBillWave className="text-emerald-400" />
                            </button>
                            <button
                              onClick={() => handleOpenQuitarModal(divida)}
                              className="p-2 rounded-lg bg-lime-600/30 hover:bg-lime-600/50 transition-colors"
                              title="Quitar dívida"
                            >
                              <FaCheck className="text-lime-400" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(divida)}
                          className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                        >
                          <FaEdit className="text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(divida)}
                          className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-600/50 transition-colors"
                        >
                          <FaTrash className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progresso do pagamento</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            divida.is_paid
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              : "bg-gradient-to-r from-orange-500 to-orange-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor total:</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(divida.total_value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor pago:</span>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(divida.paid_value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Restante:</span>
                        <span
                          className={`font-semibold ${remaining > 0 ? "text-orange-400" : "text-emerald-400"}`}
                        >
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vencimento:</span>
                        <span
                          className={`font-medium ${overdue ? "text-red-400" : ""}`}
                        >
                          {formatDate(divida.due_date)}
                        </span>
                      </div>
                    </div>

                    {divida.is_paid && divida.paid_at && (
                      <div className="mt-4 flex items-center justify-between text-emerald-400 bg-emerald-600/20 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaCheck />
                          <span className="text-sm font-medium">
                            Dívida quitada!
                          </span>
                        </div>
                        <span className="text-xs text-emerald-300">
                          {formatDate(divida.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn overflow-y-auto py-4">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-lg border border-gray-700/50 transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingDivida ? "Editar Dívida" : "Nova Dívida"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                  placeholder="Ex: Cartão Nubank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Credor (opcional)
                </label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) =>
                    setFormData({ ...formData, creditor: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                  placeholder="Ex: Banco, Loja, Pessoa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Valor Total da Dívida
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.totalValue}
                    onChange={(e) =>
                      handleCurrencyChange("totalValue", e.target.value)
                    }
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Valor já Pago
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.paidValue}
                    onChange={(e) =>
                      handleCurrencyChange("paidValue", e.target.value)
                    }
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Data de Vencimento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500 resize-none"
                  placeholder="Observações sobre a dívida..."
                  rows="3"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] border border-green-500/30"
                >
                  {editingDivida ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Pagar */}
      {showPayModal && dividaToPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Pagar Dívida
              </h2>
              <button
                onClick={handleClosePayModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                  <FaMoneyBillWave className="text-3xl text-emerald-400" />
                </div>
              </div>

              <p className="text-gray-300 text-center mb-4">
                Pagar a dívida{" "}
                <span className="font-semibold text-white">
                  "{dividaToPay.title}"
                </span>
              </p>

              <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(dividaToPay.total_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Já pago:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(dividaToPay.paid_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Restante:</span>
                  <span className="font-semibold text-orange-400">
                    {formatCurrency(
                      dividaToPay.total_value - dividaToPay.paid_value,
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Quanto deseja pagar?
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={payValue}
                    onChange={(e) =>
                      setPayValue(formatInputCurrency(e.target.value))
                    }
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                    autoFocus
                  />
                </div>
              </div>

              {payValue && parseCurrencyToNumber(payValue) > 0 && (
                <div className="mt-4 p-3 bg-emerald-600/20 rounded-lg">
                  <p className="text-sm text-emerald-300 text-center">
                    Novo valor pago:{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        dividaToPay.paid_value +
                          parseCurrencyToNumber(payValue),
                      )}
                    </span>
                    {dividaToPay.paid_value + parseCurrencyToNumber(payValue) >=
                      dividaToPay.total_value && (
                      <span className="block mt-1 text-emerald-400 font-medium">
                        A dívida será quitada!
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleClosePayModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-[1.02] border border-gray-500/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePayDivida}
                disabled={!payValue || parseCurrencyToNumber(payValue) <= 0}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-3 rounded-xl w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Excluir */}
      {showDeleteModal && dividaToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Excluir Dívida
              </h2>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                  <FaTrash className="text-3xl text-red-400" />
                </div>
              </div>

              <p className="text-gray-300 text-center mb-4">
                Tem certeza que deseja excluir a dívida{" "}
                <span className="font-semibold text-white">
                  "{dividaToDelete.title}"
                </span>
                ?
              </p>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(dividaToDelete.total_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor pago:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(dividaToDelete.paid_value)}
                  </span>
                </div>
              </div>

              <p className="text-red-400 text-sm text-center mt-4">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-[1.02] border border-gray-500/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] border border-red-500/30"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Quitar */}
      {showQuitarModal && dividaToQuitar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Quitar Dívida
              </h2>
              <button
                onClick={handleCloseQuitarModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-lime-600/20 rounded-full flex items-center justify-center">
                  <FaCheckDouble className="text-3xl text-lime-400" />
                </div>
              </div>

              <p className="text-gray-300 text-center mb-4">
                Deseja quitar completamente a dívida{" "}
                <span className="font-semibold text-white">
                  "{dividaToQuitar.title}"
                </span>
                ?
              </p>

              <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(dividaToQuitar.total_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Já pago:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(dividaToQuitar.paid_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Será quitado:</span>
                  <span className="font-semibold text-lime-400">
                    {formatCurrency(
                      dividaToQuitar.total_value - dividaToQuitar.paid_value,
                    )}
                  </span>
                </div>
              </div>

              <p className="text-lime-400 text-sm text-center">
                O valor pago será atualizado para o valor total da dívida.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleCloseQuitarModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-[1.02] border border-gray-500/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleQuitarDivida}
                className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-500 hover:to-lime-600 text-white px-6 py-3 rounded-xl w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40 hover:scale-[1.02] border border-lime-500/30"
              >
                Quitar Dívida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
