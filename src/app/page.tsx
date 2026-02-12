import { redirect } from "next/navigation";

/**
 * PÁGINA: Root (/)
 * OBJETIVO: Redirecionamento Automático
 * * Como a aplicação foca na gestão de produtos, não temos uma "Landing Page".
 * Por isso, ao acessar a raiz, o usuário é imediatamente enviado para
 * o painel principal em /produtos.
 */
export default function Home() {
  redirect("/produtos");
}
