import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTrophy, FaUndo, FaPiggyBank, FaSearch, FaImage } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { sanitizeText, sanitizeNumber, validateMetaForm } from "../utils/sanitize";

export default function Metas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [metas, setMetas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("em_andamento");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [metaToComplete, setMetaToComplete] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [metaToAddMoney, setMetaToAddMoney] = useState(null);
  const [addMoneyValue, setAddMoneyValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [metaToDelete, setMetaToDelete] = useState(null);
  const [imageSearch, setImageSearch] = useState("");
  const [imageResults, setImageResults] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    targetValue: "",
    currentValue: "",
    deadline: "",
    category: "Economia",
    imageUrl: "",
  });

  const categories = [
    "Economia",
    "Investimento",
    "Emergência",
    "Viagem",
    "Educação",
    "Compras",
    "Outros",
  ];

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/transacoes" ||
    location.pathname === "/metas";

  useEffect(() => {
    const checkAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      await loadMetas(user.id);
    };

    checkAndLoad();
  }, [navigate]);

  const loadMetas = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("metas")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar metas:", error);
        return;
      }

      setMetas(data || []);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    }
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

    const cleanTitle = sanitizeText(formData.title, 100);
    const targetValue = sanitizeNumber(parseCurrencyToNumber(formData.targetValue), 0.01, 999999999.99);
    const currentValue = sanitizeNumber(parseCurrencyToNumber(formData.currentValue) || 0, 0, 999999999.99);

    const errors = validateMetaForm({
      title: cleanTitle,
      targetValue,
      category: formData.category,
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const metaData = {
      title: cleanTitle,
      target_value: targetValue,
      current_value: currentValue,
      deadline: formData.deadline || null,
      category: formData.category,
      image_url: formData.imageUrl || null,
      user_id: user.id,
    };

    try {
      if (editingMeta) {
        const { error } = await supabase
          .from("metas")
          .update(metaData)
          .eq("id", editingMeta.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setMetas((prev) =>
          prev.map((m) =>
            m.id === editingMeta.id ? { ...m, ...metaData } : m
          )
        );
        setSuccessMessage("Meta atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("metas")
          .insert([metaData])
          .select()
          .single();

        if (error) throw error;

        setMetas((prev) => [data, ...prev]);
        setSuccessMessage("Meta criada com sucesso!");
      }

      handleCloseModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      alert("Ocorreu um erro ao salvar a meta. Tente novamente.");
    }
  };

  const handleOpenDeleteModal = (meta) => {
    setMetaToDelete(meta);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setMetaToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!metaToDelete) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { error } = await supabase
        .from("metas")
        .delete()
        .eq("id", metaToDelete.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMetas((prev) => prev.filter((m) => m.id !== metaToDelete.id));
      setSuccessMessage("Meta excluída com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
    }
  };

  const handleEdit = (meta) => {
    setEditingMeta(meta);
    setFormData({
      title: meta.title,
      targetValue: meta.target_value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currentValue: meta.current_value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      deadline: meta.deadline || "",
      category: meta.category,
      imageUrl: meta.image_url || "",
    });
    setShowModal(true);
  };

  const handleOpenConfirmComplete = (meta) => {
    setMetaToComplete(meta);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setMetaToComplete(null);
    setShowConfirmModal(false);
  };

  const handleConfirmToggleCompleted = async () => {
    if (!metaToComplete) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const newCompletedStatus = !metaToComplete.completed;

    try {
      const { error } = await supabase
        .from("metas")
        .update({ 
          completed: newCompletedStatus,
          completed_at: newCompletedStatus ? new Date().toISOString() : null
        })
        .eq("id", metaToComplete.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMetas((prev) =>
        prev.map((m) =>
          m.id === metaToComplete.id 
            ? { ...m, completed: newCompletedStatus, completed_at: newCompletedStatus ? new Date().toISOString() : null } 
            : m
        )
      );
      setSuccessMessage(newCompletedStatus ? "Meta marcada como concluída!" : "Meta reaberta!");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseConfirmModal();
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeta(null);
    setFormData({
      title: "",
      targetValue: "",
      currentValue: "",
      deadline: "",
      category: "Economia",
      imageUrl: "",
    });
    setImageSearch("");
    setImageResults([]);
  };

  const predefinedImages = {
    economia: [
      { id: "eco1", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800", thumb: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200", alt: "Dinheiro" },
      { id: "eco2", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800", thumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200", alt: "Cofrinho" },
      { id: "eco3", url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800", thumb: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200", alt: "Moedas" },
      { id: "eco4", url: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800", thumb: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=200", alt: "Poupança" },
      { id: "eco5", url: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800", thumb: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=200", alt: "Carteira" },
      { id: "eco6", url: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=800", thumb: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=200", alt: "Finanças" },
    ],
    viagem: [
      { id: "via1", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200", alt: "Praia" },
      { id: "via2", url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", thumb: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200", alt: "Avião" },
      { id: "via3", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200", alt: "Natureza" },
      { id: "via4", url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800", thumb: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200", alt: "Destino" },
      { id: "via5", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200", alt: "Lago" },
      { id: "via6", url: "https://images.unsplash.com/photo-1499591934245-40b55745b905?w=800", thumb: "https://images.unsplash.com/photo-1499591934245-40b55745b905?w=200", alt: "Montanha" },
    ],
    educação: [
      { id: "edu1", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", thumb: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200", alt: "Universidade" },
      { id: "edu2", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800", thumb: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200", alt: "Livros" },
      { id: "edu3", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", thumb: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200", alt: "Estudo" },
      { id: "edu4", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800", thumb: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200", alt: "Caderno" },
      { id: "edu5", url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", thumb: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200", alt: "Biblioteca" },
      { id: "edu6", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800", thumb: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200", alt: "Aula" },
    ],
    compras: [
      { id: "com1", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", thumb: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200", alt: "Shopping" },
      { id: "com2", url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800", thumb: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200", alt: "Loja" },
      { id: "com3", url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800", thumb: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200", alt: "Sacolas" },
      { id: "com4", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800", thumb: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200", alt: "Vitrine" },
      { id: "com5", url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800", thumb: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200", alt: "Cartão" },
      { id: "com6", url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800", thumb: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200", alt: "Carrinho" },
    ],
    investimento: [
      { id: "inv1", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800", thumb: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200", alt: "Ações" },
      { id: "inv2", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800", thumb: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200", alt: "Bitcoin" },
      { id: "inv3", url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800", thumb: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=200", alt: "Gráfico" },
      { id: "inv4", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200", alt: "Dashboard" },
      { id: "inv5", url: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800", thumb: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=200", alt: "Crescimento" },
      { id: "inv6", url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800", thumb: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200", alt: "Dólares" },
    ],
    emergência: [
      { id: "eme1", url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800", thumb: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200", alt: "Segurança" },
      { id: "eme2", url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800", thumb: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200", alt: "Planejamento" },
      { id: "eme3", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800", thumb: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200", alt: "Proteção" },
      { id: "eme4", url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800", thumb: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=200", alt: "Reserva" },
      { id: "eme5", url: "https://images.unsplash.com/photo-1586034679970-cb7b5fc4928a?w=800", thumb: "https://images.unsplash.com/photo-1586034679970-cb7b5fc4928a?w=200", alt: "Casa" },
      { id: "eme6", url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800", thumb: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=200", alt: "Tempo" },
    ],
    outros: [
      { id: "out1", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800", thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200", alt: "Objetivo" },
      { id: "out2", url: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800", thumb: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=200", alt: "Sucesso" },
      { id: "out3", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800", thumb: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200", alt: "Equipe" },
      { id: "out4", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800", thumb: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200", alt: "Tecnologia" },
      { id: "out5", url: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800", thumb: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200", alt: "Trabalho" },
      { id: "out6", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800", thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200", alt: "Colaboração" },
    ],
  };

  const searchImages = async (query) => {
    if (!query.trim()) {
      setImageResults([]);
      return;
    }

    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
    setLoadingImages(true);

    try {
      if (apiKey) {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`,
          { headers: { Authorization: apiKey } }
        );
        const data = await res.json();
        const results = (data.photos || []).map((photo) => ({
          id: String(photo.id),
          url: photo.src.large2x || photo.src.large || photo.src.original,
          thumb: photo.src.small || photo.src.medium,
          alt: photo.alt || query,
        }));
        setImageResults(results);
      } else {
        const searchLower = query.toLowerCase();
        let results = [];
        if (searchLower.includes("econom") || searchLower.includes("poupar") || searchLower.includes("dinheiro")) results = predefinedImages.economia;
        else if (searchLower.includes("viag") || searchLower.includes("praia") || searchLower.includes("férias")) results = predefinedImages.viagem;
        else if (searchLower.includes("educa") || searchLower.includes("estud") || searchLower.includes("livro") || searchLower.includes("curso")) results = predefinedImages.educação;
        else if (searchLower.includes("compr") || searchLower.includes("shopping") || searchLower.includes("loja")) results = predefinedImages.compras;
        else if (searchLower.includes("invest") || searchLower.includes("ação") || searchLower.includes("bolsa") || searchLower.includes("cripto")) results = predefinedImages.investimento;
        else if (searchLower.includes("emergên") || searchLower.includes("reserva") || searchLower.includes("segur")) results = predefinedImages.emergência;
        else results = predefinedImages.outros;
        setImageResults(results);
      }
    } catch (err) {
      console.error("Erro ao buscar imagens:", err);
      setImageResults(predefinedImages.outros);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSelectImage = (imageUrl) => {
    setFormData({ ...formData, imageUrl });
  };

  const handleOpenAddMoney = (meta) => {
    setMetaToAddMoney(meta);
    setAddMoneyValue("");
    setShowAddMoneyModal(true);
  };

  const handleCloseAddMoneyModal = () => {
    setMetaToAddMoney(null);
    setAddMoneyValue("");
    setShowAddMoneyModal(false);
  };

  const handleAddMoney = async () => {
    if (!metaToAddMoney || !addMoneyValue) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const valueToAdd = parseCurrencyToNumber(addMoneyValue);
    if (isNaN(valueToAdd) || valueToAdd <= 0) return;

    const newCurrentValue = metaToAddMoney.current_value + valueToAdd;

    try {
      const { error } = await supabase
        .from("metas")
        .update({ current_value: newCurrentValue })
        .eq("id", metaToAddMoney.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMetas((prev) =>
        prev.map((m) =>
          m.id === metaToAddMoney.id
            ? { ...m, current_value: newCurrentValue }
            : m
        )
      );
      setSuccessMessage(`R$ ${valueToAdd.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} adicionado à meta!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseAddMoneyModal();
    } catch (error) {
      console.error("Erro ao adicionar valor:", error);
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

  const getProgress = (current, target) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "from-green-500 to-green-600";
    if (progress >= 75) return "from-lime-500 to-lime-600";
    if (progress >= 50) return "from-yellow-500 to-yellow-600";
    if (progress >= 25) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sem prazo";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  /**
   * Calcula quantos meses restam até a data de vencimento.
   * Retorna 0 se o prazo já passou ou não há deadline.
   */
  const getMesesRestantes = (deadline) => {
    if (!deadline) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prazo = new Date(deadline);
    prazo.setHours(0, 0, 0, 0);
    if (prazo <= hoje) return 0;
    const diffMs = prazo - hoje;
    const diffMeses = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    return Math.max(1, diffMeses);
  };

  /**
   * Calcula quanto guardar por mês para atingir a meta no prazo.
   * Retorna null se não há deadline ou prazo já venceu.
   */
  const getPoupancaMensalNecessaria = (meta) => {
    const meses = getMesesRestantes(meta.deadline);
    if (meses === null || meses <= 0) return null;
    const valorFaltante = Math.max(0, meta.target_value - meta.current_value);
    if (valorFaltante <= 0) return 0;
    return valorFaltante / meses;
  };

  /**
   * Avalia a viabilidade do objetivo com base no valor mensal necessário.
   * Considera viável até R$ 2.000/mês, atenção até R$ 5.000, desafiador acima.
   */
  const getViabilidade = (meta) => {
    if (!meta.deadline) {
      return { status: "sem_prazo", label: "Sem prazo definido", cor: "text-gray-400", bg: "bg-gray-600/20" };
    }
    const meses = getMesesRestantes(meta.deadline);
    if (meses === 0) {
      return { status: "prazo_vencido", label: "Prazo vencido", cor: "text-red-400", bg: "bg-red-600/20" };
    }
    const poupancaMensal = getPoupancaMensalNecessaria(meta);
    if (poupancaMensal === null || poupancaMensal <= 0) {
      return { status: "meta_atingida", label: "Meta alcançada!", cor: "text-emerald-400", bg: "bg-emerald-600/20" };
    }
    if (poupancaMensal <= 2000) {
      return { status: "viavel", label: "Objetivo viável", cor: "text-emerald-400", bg: "bg-emerald-600/20" };
    }
    if (poupancaMensal <= 5000) {
      return { status: "atencao", label: "Exige comprometimento", cor: "text-amber-400", bg: "bg-amber-600/20" };
    }
    return { status: "desafiadora", label: "Meta desafiadora", cor: "text-orange-400", bg: "bg-orange-600/20" };
  };

  const metasEmAndamento = useMemo(
    () => metas.filter((m) => !m.completed),
    [metas]
  );

  const metasConcluidas = useMemo(
    () => metas.filter((m) => m.completed),
    [metas]
  );

  const currentMetas = activeTab === "em_andamento" ? metasEmAndamento : metasConcluidas;

  return (
    <div className="text-white flex min-h-screen">
      {showSidebar && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 md:ml-28 ml-0 flex flex-col pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Metas Financeiras</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition duration-300"
            >
              <FaPlus className="text-lg" />
              <span>Nova Meta</span>
            </button>
          </div>

          {successMessage && (
            <div className="bg-green-600 text-white p-2 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Abas */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("em_andamento")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "em_andamento"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FaCheck className="text-sm" />
              Em Andamento ({metasEmAndamento.length})
            </button>
            <button
              onClick={() => setActiveTab("concluidas")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "concluidas"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FaTrophy className="text-sm" />
              Concluídas ({metasConcluidas.length})
            </button>
          </div>

          {currentMetas.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-md p-8 rounded-xl border border-indigo-500/20 text-center">
              <p className="text-gray-400 text-lg">
                {activeTab === "em_andamento"
                  ? "Você não tem metas em andamento."
                  : "Você ainda não concluiu nenhuma meta."}
              </p>
              <p className="text-gray-500 mt-2">
                {activeTab === "em_andamento"
                  ? "Clique em \"Nova Meta\" para começar a planejar seus objetivos financeiros."
                  : "Continue trabalhando nas suas metas para vê-las aqui!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMetas.map((meta) => {
                const progress = getProgress(meta.current_value, meta.target_value);
                const progressColor = getProgressColor(progress);

                return (
                  <div
                    key={meta.id}
                    className={`relative overflow-hidden rounded-xl border shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 ${
                      meta.completed 
                        ? "border-emerald-500/30" 
                        : "border-indigo-500/20"
                    }`}
                  >
                    {meta.image_url && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${meta.image_url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/85 to-gray-900/60" />
                      </div>
                    )}
                    <div className={`relative p-6 ${
                      !meta.image_url && `bg-gradient-to-br ${
                        meta.completed 
                          ? "from-emerald-900/30 via-emerald-800/20 to-emerald-900/30" 
                          : "from-gray-800/40 via-gray-800/30 to-gray-800/40"
                      } backdrop-blur-md`
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-600/30 text-indigo-300">
                            {meta.category}
                          </span>
                          {meta.completed && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center gap-1">
                              <FaTrophy className="text-xs" />
                              Concluída
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mt-2">
                          {meta.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenConfirmComplete(meta)}
                          className={`p-2 rounded-lg transition-colors ${
                            meta.completed
                              ? "bg-orange-600/30 hover:bg-orange-600/50"
                              : "bg-emerald-600/30 hover:bg-emerald-600/50"
                          }`}
                          title={meta.completed ? "Reabrir meta" : "Marcar como concluída"}
                        >
                          {meta.completed ? (
                            <FaUndo className="text-orange-400" />
                          ) : (
                            <FaTrophy className="text-emerald-400" />
                          )}
                        </button>
                        {!meta.completed && (
                          <button
                            onClick={() => handleOpenAddMoney(meta)}
                            className="p-2 rounded-lg bg-lime-600/30 hover:bg-lime-600/50 transition-colors"
                            title="Adicionar dinheiro"
                          >
                            <FaPiggyBank className="text-lime-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(meta)}
                          className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                        >
                          <FaEdit className="text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(meta)}
                          className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-600/50 transition-colors"
                          title="Excluir meta"
                        >
                          <FaTrash className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progresso</span>
                        <span>
                          {progress.toFixed(1)}%
                          {progress >= 100 && (
                            <span className="text-emerald-400 font-medium ml-1">· Meta alcançada!</span>
                          )}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-gray-700 rounded-full overflow-visible">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                              progress >= 100 ? "from-emerald-500 to-emerald-600" : progressColor
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        {progress >= 100 && (
                          <div className="absolute inset-0 pointer-events-none overflow-visible">
                            {[
                              { x: "-6px", y: "-24px", delay: "0s", color: "bg-amber-400" },
                              { x: "4px", y: "-28px", delay: "0.2s", color: "bg-emerald-400" },
                              { x: "-12px", y: "-20px", delay: "0.4s", color: "bg-yellow-300" },
                              { x: "8px", y: "-22px", delay: "0.1s", color: "bg-amber-300" },
                              { x: "-2px", y: "-26px", delay: "0.3s", color: "bg-emerald-300" },
                              { x: "6px", y: "-18px", delay: "0.5s", color: "bg-amber-500" },
                              { x: "-8px", y: "-30px", delay: "0.15s", color: "bg-emerald-500" },
                              { x: "2px", y: "-16px", delay: "0.35s", color: "bg-yellow-400" },
                              { x: "-4px", y: "-22px", delay: "0.45s", color: "bg-amber-400" },
                              { x: "10px", y: "-26px", delay: "0.25s", color: "bg-emerald-400" },
                            ].map((p, i) => (
                              <div
                                key={i}
                                className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-sm ${p.color} animate-confetti-bar`}
                                style={{
                                  "--cf-x": p.x,
                                  "--cf-y": p.y,
                                  animationDelay: p.delay,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Atual:</span>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(meta.current_value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Meta:</span>
                        <span className="font-semibold">
                          {formatCurrency(meta.target_value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prazo:</span>
                        <span className="font-medium">
                          {formatDate(meta.deadline)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Falta:</span>
                        <span className="font-semibold text-orange-400">
                          {formatCurrency(
                            Math.max(0, meta.target_value - meta.current_value)
                          )}
                        </span>
                      </div>
                      {!meta.completed && meta.deadline && (() => {
                        const poupancaMensal = getPoupancaMensalNecessaria(meta);
                        const meses = getMesesRestantes(meta.deadline);
                        const viabilidade = getViabilidade(meta);
                        return (
                          <>
                            {meses !== null && meses > 0 && meta.target_value > meta.current_value && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Guardar/mês:</span>
                                <span className="font-semibold text-indigo-300">
                                  {formatCurrency(poupancaMensal)}
                                </span>
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${viabilidade.bg} ${viabilidade.cor}`}>
                                {viabilidade.label}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {meta.completed && meta.completed_at && (
                      <div className="mt-4 flex items-center justify-between text-emerald-400 bg-emerald-600/20 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaTrophy />
                          <span className="text-sm font-medium">
                            Meta concluída!
                          </span>
                        </div>
                        <span className="text-xs text-emerald-300">
                          {formatDate(meta.completed_at)}
                        </span>
                      </div>
                    )}

                    {!meta.completed && progress >= 100 && (
                      <div className="mt-4 flex items-center gap-2 text-green-400 bg-green-600/20 p-2 rounded-lg">
                        <FaCheck />
                        <span className="text-sm font-medium">
                          Meta alcançada! Marque como concluída.
                        </span>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn overflow-y-auto py-4">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-lg lg:max-w-2xl border border-gray-700/50 transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {editingMeta ? "Editar Meta" : "Nova Meta"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                  maxLength={100}
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                  placeholder="Ex: Reserva de emergência"
                  required
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
                  Valor da Meta
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.targetValue}
                    onChange={(e) => handleCurrencyChange("targetValue", e.target.value)}
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Valor Atual
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.currentValue}
                    onChange={(e) => handleCurrencyChange("currentValue", e.target.value)}
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Prazo (opcional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none cursor-pointer"
                />
                {formData.deadline && formData.targetValue && (() => {
                  const target = parseCurrencyToNumber(formData.targetValue);
                  const current = parseCurrencyToNumber(formData.currentValue) || 0;
                  if (target <= 0) return null;
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const prazo = new Date(formData.deadline);
                  prazo.setHours(0, 0, 0, 0);
                  const meses = prazo <= hoje ? 0 : Math.max(1, Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24 * 30.44)));
                  const faltante = Math.max(0, target - current);
                  const poupancaMensal = meses > 0 ? faltante / meses : null;
                  const viab = !formData.deadline ? { label: "Sem prazo", cor: "text-gray-400", bg: "bg-gray-600/20" }
                    : meses === 0 ? { label: "Prazo vencido", cor: "text-red-400", bg: "bg-red-600/20" }
                    : faltante <= 0 ? { label: "Meta já atingida", cor: "text-emerald-400", bg: "bg-emerald-600/20" }
                    : poupancaMensal <= 2000 ? { label: "Objetivo viável", cor: "text-emerald-400", bg: "bg-emerald-600/20" }
                    : poupancaMensal <= 5000 ? { label: "Exige comprometimento", cor: "text-amber-400", bg: "bg-amber-600/20" }
                    : { label: "Meta desafiadora", cor: "text-orange-400", bg: "bg-orange-600/20" };
                  return (
                    <div className="mt-3 p-3 rounded-lg bg-gray-700/30 space-y-1">
                      {meses > 0 && faltante > 0 && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Guardar por mês: </span>
                          <span className="font-semibold text-indigo-300">
                            {formatCurrency(poupancaMensal)}
                          </span>
                          <span className="text-gray-500 text-xs ml-1">({meses} meses restantes)</span>
                        </p>
                      )}
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${viab.bg} ${viab.cor}`}>
                        {viab.label}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Imagem de Fundo (opcional)
                </label>
                
                {formData.imageUrl && (
                  <div className="mb-3 relative">
                    <img
                      src={formData.imageUrl}
                      alt="Imagem selecionada"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 p-1.5 rounded-full transition-colors"
                    >
                      <IoClose className="text-white text-sm" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={imageSearch}
                      onChange={(e) => setImageSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchImages(imageSearch);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500 text-sm"
                      placeholder="Buscar imagem..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => searchImages(imageSearch)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors text-sm font-medium"
                  >
                    Buscar
                  </button>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {["Economia", "Viagem", "Educação", "Compras", "Investimento"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setImageSearch(term);
                        searchImages(term);
                      }}
                      className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600 rounded-full transition-colors text-gray-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {loadingImages && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                )}

                {imageResults.length > 0 && !loadingImages && (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-lg">
                    {imageResults.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => handleSelectImage(image.url)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          formData.imageUrl === image.url
                            ? "border-indigo-500 ring-2 ring-indigo-500/50"
                            : "border-transparent hover:border-gray-500"
                        }`}
                      >
                        <img
                          src={image.thumb}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                        {formData.imageUrl === image.url && (
                          <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                            <FaCheck className="text-white text-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {!loadingImages && imageResults.length === 0 && imageSearch && (
                  <p className="text-gray-500 text-sm text-center py-2">
                    Clique em "Buscar" ou pressione Enter para buscar imagens
                  </p>
                )}
              </div>

              <div className="lg:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-2">
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
                  {editingMeta ? "Salvar" : "Criar Meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && metaToComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {metaToComplete.completed ? "Reabrir Meta" : "Concluir Meta"}
              </h2>
              <button
                onClick={handleCloseConfirmModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="mb-6">
              {metaToComplete.completed ? (
                <>
                  <p className="text-gray-300 mb-4">
                    Deseja reabrir a meta <span className="font-semibold text-white">"{metaToComplete.title}"</span>?
                  </p>
                  <p className="text-gray-400 text-sm">
                    A meta voltará para a lista de metas em andamento.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center">
                      <FaTrophy className="text-4xl text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-gray-300 text-center mb-4">
                    Parabéns! Deseja marcar a meta <span className="font-semibold text-white">"{metaToComplete.title}"</span> como concluída?
                  </p>
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Valor da meta:</span>
                      <span className="font-semibold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(metaToComplete.target_value)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Valor atual:</span>
                      <span className="font-semibold text-emerald-400">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(metaToComplete.current_value)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleCloseConfirmModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-[1.02] border border-gray-500/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleCompleted}
                className={`px-6 py-3 rounded-xl w-full sm:w-auto transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] border ${
                  metaToComplete.completed
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 shadow-orange-500/30 hover:shadow-orange-500/40 border-orange-500/30"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/30 hover:shadow-emerald-500/40 border-emerald-500/30"
                } text-white`}
              >
                {metaToComplete.completed ? "Reabrir Meta" : "Concluir Meta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMoneyModal && metaToAddMoney && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Adicionar Dinheiro
              </h2>
              <button
                onClick={handleCloseAddMoneyModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-lime-600/20 rounded-full flex items-center justify-center">
                  <FaPiggyBank className="text-3xl text-lime-400" />
                </div>
              </div>
              
              <p className="text-gray-300 text-center mb-4">
                Adicionar valor à meta <span className="font-semibold text-white">"{metaToAddMoney.title}"</span>
              </p>

              <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Valor atual:</span>
                  <span className="font-semibold text-emerald-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(metaToAddMoney.current_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Meta:</span>
                  <span className="font-semibold text-white">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(metaToAddMoney.target_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Falta:</span>
                  <span className="font-semibold text-orange-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Math.max(0, metaToAddMoney.target_value - metaToAddMoney.current_value))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-indigo-200">
                  Quanto deseja adicionar?
                </label>
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-3 rounded-l-xl border border-gray-600/50 font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addMoneyValue}
                    onChange={(e) => setAddMoneyValue(formatInputCurrency(e.target.value))}
                    className="w-full p-3 rounded-r-xl bg-gray-700/50 text-white border border-gray-600/50 border-l-0 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-500"
                    placeholder="0,00"
                    autoFocus
                  />
                </div>
              </div>

              {addMoneyValue && parseCurrencyToNumber(addMoneyValue) > 0 && (
                <div className="mt-4 p-3 bg-lime-600/20 rounded-lg">
                  <p className="text-sm text-lime-300 text-center">
                    Novo valor: <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(metaToAddMoney.current_value + parseCurrencyToNumber(addMoneyValue))}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleCloseAddMoneyModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-[1.02] border border-gray-500/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddMoney}
                disabled={!addMoneyValue || parseCurrencyToNumber(addMoneyValue) <= 0}
                className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-lime-500 hover:to-lime-600 text-white px-6 py-3 rounded-xl w-full sm:w-auto transition-all duration-200 font-medium shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40 hover:scale-[1.02] border border-lime-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && metaToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-2 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-md border border-gray-700/50 transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Excluir Meta
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
                Tem certeza que deseja excluir a meta <span className="font-semibold text-white">"{metaToDelete.title}"</span>?
              </p>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Categoria:</span>
                  <span className="font-medium text-indigo-300">{metaToDelete.category}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Valor atual:</span>
                  <span className="font-semibold text-emerald-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(metaToDelete.current_value)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Meta:</span>
                  <span className="font-semibold text-white">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(metaToDelete.target_value)}
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
                Excluir Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
