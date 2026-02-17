"use client";

/**
 * PÁGINA: Gerenciamento de Produtos
 * DESCRIÇÃO: Implementa um CRUD completo (Create, Read, Update, Delete).
 * ARQUITETURA: Client-side rendering usando React Hooks para estado e efeitos.
 */

import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/services/api"; // Importando a URL centralizada

/**
 * Interface que define a estrutura de um Produto no sistema.
 * Garante a tipagem forte do TypeScript para evitar erros de acesso a propriedades.
 */
type Product = {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
};

export default function ProdutosPage() {
  // ================= ESTADOS DA APLICAÇÃO (STATE) =================

  // Armazena a lista de produtos carregada do backend
  const [products, setProducts] = useState<Product[]>([]);

  // Estados controlados para os inputs do formulário
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Controla se estamos criando (null) ou editando (string com ID)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Controla o feedback visual de carregamento para o usuário
  const [loading, setLoading] = useState(false);

  // ================= MÉTODOS DE API (SERVICES) =================

  /**
   * Busca todos os produtos na API e normaliza os dados recebidos.
   * É chamada automaticamente quando a página carrega (via useEffect)
   * e após cada operação de criação, atualização ou exclusão.
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.products);
      if (!res.ok) throw new Error("Falha na comunicação com a API");
      const data = await res.json();

      console.log("📥 Dados brutos da API:", data);

      // Extrai o array de produtos: pode vir como array direto ou dentro de { data: [...] }
      // Usamos const porque rawProducts não será reatribuído
      const rawProducts = Array.isArray(data) ? data : data.data || [];

      // Normaliza cada produto, convertendo price para número
      // Tipamos o parâmetro item como unknown para evitar any, depois fazemos as verificações
      const productList: Product[] = rawProducts.map((item: unknown) => {
        // Garantimos que item é um objeto antes de acessar propriedades
        if (typeof item !== "object" || item === null) {
          return {
            id: "",
            name: "",
            price: 0,
            quantity: 0,
          };
        }

        // Usamos type assertion segura com Record<string, unknown> para acessar propriedades
        const record = item as Record<string, unknown>;

        // Tenta extrair o preço de diferentes nomes de campo
        const rawPrice = record.price ?? record.preco ?? record.valor;

        // Converte para número corretamente
        let numericPrice = 0;
        if (typeof rawPrice === "number") {
          numericPrice = rawPrice;
        } else if (typeof rawPrice === "string") {
          // Substitui vírgula por ponto e converte
          numericPrice = parseFloat(rawPrice.replace(",", ".")) || 0;
        }

        // Log para depuração (remova em produção)
        console.log(
          `🎯 Produto ${record.name}: rawPrice =`,
          rawPrice,
          `(${typeof rawPrice}) → convertido =`,
          numericPrice,
        );

        return {
          id: (record.id as string) || (record._id as string) || "",
          name: (record.name as string) || (record.nome as string) || "",
          price: numericPrice,
          quantity:
            (record.quantity as number) ??
            (record.quantidade as number) ??
            (record.estoque as number) ??
            0,
        };
      });

      console.log("✅ Produtos normalizados:", productList);
      setProducts(productList);
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      alert("Não foi possível carregar a lista de produtos.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hook de Efeito: Executa uma vez ao montar o componente.
   * Similar ao "componentDidMount" em classes.
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= MANIPULADORES DE EVENTOS (HANDLERS) =================

  /** Limpa os campos do formulário e reseta o modo de edição */
  const resetForm = () => {
    setName("");
    setPrice("");
    setQuantity("");
    setEditingId(null);
  };

  /** Preenche o formulário com os dados do produto selecionado para edição */
  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(String(product.price ?? "")); // Converte número para string para o input
    setQuantity(String(product.quantity ?? ""));
    setEditingId(product.id);

    // Rola a página para o topo para facilitar a edição em mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Gerencia o envio do formulário (Criação ou Atualização) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento padrão da página

    // Validação básica frontend
    if (!name || !price || !quantity) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Converte o preço: substitui vírgula por ponto e converte para número
    const precoLimpo = price.replace(",", ".");
    const precoNumerico = Number(precoLimpo);
    if (isNaN(precoNumerico)) {
      alert("Preço inválido. Use apenas números e ponto ou vírgula.");
      return;
    }

    // Monta o objeto a ser enviado para a API
    const productData = {
      name,
      price: precoNumerico,
      quantity: Number(quantity),
    };

    // LOG PARA DEPURAÇÃO: veja o que está sendo enviado ao backend
    console.log("📤 Enviando produto para API:", productData);

    try {
      setLoading(true);

      // Define se vai criar (POST) ou atualizar (PUT) baseado no editingId
      const url = editingId
        ? `${ENDPOINTS.products}/${editingId}`
        : ENDPOINTS.products;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        // Tenta obter a mensagem de erro da resposta, se houver
        const errorData = await res.json().catch(() => null);
        console.error("❌ Resposta de erro da API:", errorData);
        throw new Error("Erro ao salvar dados");
      }

      // Sucesso: Limpa form e recarrega a lista
      resetForm();
      await fetchProducts();
      alert(editingId ? "Produto atualizado!" : "Produto cadastrado!");
    } catch (error) {
      console.error("❌ Erro na operação:", error);
      alert("Erro ao salvar o produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /** Remove um produto do banco de dados */
  const handleDelete = async (id: string) => {
    // Confirmação nativa do navegador para evitar cliques acidentais
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${ENDPOINTS.products}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao deletar");

      await fetchProducts(); // Atualiza a lista visualmente
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      alert("Não foi possível excluir o produto.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDERIZAÇÃO (JSX) =================
  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          📦 Controle de Estoque
        </h1>
        <p className="text-gray-500">
          Gerencie seus produtos de forma simples.
        </p>
      </header>

      {/* Formulário de Cadastro/Edição */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? "✏️ Editar Produto" : "✨ Novo Produto"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* Campo Nome */}
          <div className="md:col-span-2">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 placeholder-gray-700"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Campo Preço: tipo "text" para permitir vírgula */}
          <input
            type="text"
            id="price"
            name="price"
            placeholder="Preço (R$)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 placeholder-gray-700"
            disabled={loading}
            autoComplete="off"
          />

          {/* Campo Quantidade */}
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Qtd"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 placeholder-gray-700"
            min="0"
            disabled={loading}
            autoComplete="off"
          />

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading}
            className={`
              p-2 rounded text-white font-medium transition-colors
              ${editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading
              ? "Processando..."
              : editingId
                ? "Salvar Alterações"
                : "Cadastrar"}
          </button>

          {/* Link para cancelar edição */}
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="md:col-start-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar Edição
            </button>
          )}
        </form>
      </section>

      {/* Listagem de Produtos */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Carregando estoque...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Produto</th>
                  <th className="p-4 border-b">Preço</th>
                  <th className="p-4 border-b text-center">Estoque</th>
                  <th className="p-4 border-b text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        R${" "}
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            (product.quantity || 0) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.quantity ?? 0} un
                        </span>
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded text-sm transition"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
