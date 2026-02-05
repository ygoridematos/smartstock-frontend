"use client";

/**
 * Página de gerenciamento de produtos
 * Aqui fazemos o CRUD completo consumindo o backend (Render)
 */

import { useEffect, useState } from "react";

/** ================= TIPAGEM DO PRODUTO ================= */
type Product = {
  id: string;
  name: string;
  price?: number; // opcional para evitar crash se vier undefined
  quantity?: number; // opcional pelo mesmo motivo
};

/** ================= URL DA API ================= */
// ⚠️ TROQUE se sua URL do Render mudar
const API_URL = "https://smartstock-backend-kevj.onrender.com/products";

export default function ProdutosPage() {
  /** ================= STATES ================= */

  // Lista de produtos
  const [products, setProducts] = useState<Product[]>([]);

  // Campos do formulário
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Produto em edição (null = modo criação)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Controle de carregamento
  const [loading, setLoading] = useState(false);

  /** ================= BUSCAR PRODUTOS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_URL);
      const data = await res.json();

      // Garante que sempre teremos array
      setProducts(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ================= CARREGA AO ABRIR A PÁGINA ================= */
  useEffect(() => {
    fetchProducts();
  }, []);

  /** ================= LIMPAR FORMULÁRIO ================= */
  const resetForm = () => {
    setName("");
    setPrice("");
    setQuantity("");
    setEditingId(null);
  };

  /** ================= CRIAR OU ATUALIZAR ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
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

      if (editingId) {
        /** ===== ATUALIZAR ===== */
        await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        /** ===== CRIAR ===== */
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ================= EDITAR PRODUTO ================= */
  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(String(product.price ?? ""));
    setQuantity(String(product.quantity ?? ""));
    setEditingId(product.id);
  };

  /** ================= DELETAR PRODUTO ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;

    try {
      setLoading(true);

      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      fetchProducts();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ================= RENDER ================= */
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📦 Gerenciamento de Produtos</h1>

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
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
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

                {/* Proteção contra undefined */}
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
