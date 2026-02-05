import { redirect } from "next/navigation";

/**
 * Rota raiz "/"
 * Redireciona imediatamente para a página principal do sistema
 */
export default function Home() {
  redirect("/produtos");
}
