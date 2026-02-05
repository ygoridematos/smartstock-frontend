"use client";

/**
 * Página de gerenciamento de produtos
 * CRUD completo consumindo API externa (backend no Render)
 */

import { useEffect, useState } from "react";

/** ================= TIPAGEM DO PRODUTO ================= */
type Product = {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
};

/** ================= URL BASE DA API =================
 * Em desenvolvimento → usa .env.local
 * Em produção (Vercel) → usa variável de ambiente configurada lá
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

/** Endpoint de produtos separado para evitar repetição */
const PRODUCTS_URL = `${API_BASE_URL}/products`;

export default function ProdutosPage() {
  /** ================= STATES ================= */

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** ================= FUNÇÃO PARA BUSCAR PRODUTOS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(PRODUCTS_URL);

      // Se a API estiver fora do ar ou der erro HTTP
      if (!res.ok) {
        throw new Error("Erro ao buscar produtos da API");
      }

      const data = await res.json();

      // Backend pode retornar { data: [...] } ou direto []
      const productList = Array.isArray(data) ? data : data.data;

      setProducts(productList || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Não foi possível carregar os produtos. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  /** ================= CARREGA PRODUTOS AO ABRIR ================= */
  useEffect(() => {
    fetchProducts();
  }, []);

  /** ================= LIMPA FORMULÁRIO ================= */
  const resetForm = () => {
    setName("");
    setPrice("");
    setQuantity("");
    setEditingId(null);
  };

  /** ================= CRIAR OU ATUALIZAR PRODUTO ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !quantity) {
      alert("Preencha todos os campos!");
      return;
    }

    const productData = {
      name,
      price: Number(price),
      quantity: Number(quantity),
    };

    try {
      setLoading(true);

      const url = editingId ? `${PRODUCTS_URL}/${editingId}` : PRODUCTS_URL;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar produto");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  /** ================= CARREGA DADOS NO MODO EDIÇÃO ================= */
  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(String(product.price ?? ""));
    setQuantity(String(product.quantity ?? ""));
    setEditingId(product.id);
  };

  /** ================= DELETA PRODUTO ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;

    try {
      setLoading(true);

      const res = await fetch(`${PRODUCTS_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar produto");
      }

      fetchProducts();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar produto.");
    } finally {
      setLoading(false);
    }
  };

  /** ================= RENDER ================= */
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Produtos</h1>

      {/* ================= FORMULÁRIO ================= */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Nome do produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Quantidade"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {editingId ? "Atualizar" : "Cadastrar"}
        </button>
      </form>

      {/* ================= TABELA ================= */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Preço</th>
              <th className="p-2 border">Quantidade</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t text-center">
                <td className="p-2">{product.name}</td>
                <td className="p-2">
                  R${" "}
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : "0.00"}
                </td>
                <td className="p-2">{product.quantity ?? 0}</td>
                <td className="p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 px-3 py-1 rounded text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 px-3 py-1 rounded text-white"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
