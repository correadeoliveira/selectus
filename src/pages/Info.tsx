import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, InlineNotice, PageHeading, Sparkle } from "../components";
const texts: Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: [string, string][];
  }
> = {
  sobre: {
    eyebrow: "Um encontro com o que tem valor",
    title: "Cultura que permanece.",
    intro:
      "O Selectus é um lugar para descobrir filmes, livros, arte e música — e levar cada descoberta para uma boa conversa.",
    sections: [
      [
        "Raízes e portas abertas",
        "Somos uma plataforma de inspiração cristã, com raízes católicas e participação aberta. Você não precisa declarar uma religião para fazer parte.",
      ],
      [
        "Uma curadoria com propósito",
        "Buscamos obras e ideias que convidem a olhar com atenção, pensar com liberdade e reconhecer o valor das pessoas. A orientação editorial das notícias é conservadora e aparece de forma transparente.",
      ],
      [
        "Formação por escolha",
        "Doutrina, liturgia, vida dos santos e formação católica são identificadas e acessadas por escolha. Você pode incluir essas seleções nas suas preferências.",
      ],
      [
        "Um pequeno valor para grandes encontros",
        "A oferta de referência é R$ 0,99 por mês via Pix. Convites qualificados concedem 30 dias tanto ao convidado quanto a quem convidou. Este protótipo não realiza cobranças.",
      ],
    ],
  },
  termos: {
    eyebrow: "Boas conversas precisam de cuidado",
    title: "Termos e convivência",
    intro:
      "Estas orientações representam a experiência demonstrativa. Os termos finais serão revisados antes do lançamento comercial.",
    sections: [
      [
        "Respeito em cada conversa",
        "Converse sobre as ideias com respeito às pessoas. Não são permitidos ataques pessoais, discriminação, ameaças, exposição de dados pessoais, spam ou incentivo à violência.",
      ],
      [
        "Sua voz, sua responsabilidade",
        "Você pode editar e excluir seus comentários. Não compartilhe arquivos ou textos de terceiros sem autorização. A equipe pode analisar denúncias, retirar comentários e suspender contas, com registro das medidas.",
      ],
      [
        "Moderação e recursos",
        "Denuncie um comentário pelo controle disponível no fórum. Dúvidas e pedidos de revisão podem ser registrados no suporte. Nesta demonstração, os registros existem apenas no navegador.",
      ],
      [
        "Conteúdo e acesso",
        "Obras completas disponíveis e participação nos fóruns exigem acesso pago ou bonificado ativo. A expiração preserva conta, interações e progresso. A área de relacionamentos é somente uma apresentação futura.",
      ],
      [
        "Ambiente de demonstração",
        "Não há pagamentos, envio de mensagens, verificação de identidade nem publicação em lojas. Os controles demonstrativos não representam segurança de produção.",
      ],
    ],
  },
  privacidade: {
    eyebrow: "Seu espaço merece cuidado",
    title: "Privacidade",
    intro:
      "Transparência sobre os dados deste protótipo e sobre as decisões previstas para o produto.",
    sections: [
      [
        "O que fica neste navegador",
        "Contas fictícias, preferências, curtidas, reações, progresso, comentários e ações administrativas são armazenados em localStorage. Esses dados não são sincronizados entre dispositivos. Não informe senhas, documentos ou dados pessoais reais.",
      ],
      [
        "Suas escolhas",
        "Sua coleção é privada na experiência do produto. A formação católica é opcional. Você pode bloquear pessoas, excluir comentários e solicitar a exclusão da conta demonstrativa no perfil.",
      ],
      [
        "Exclusão e restauração",
        "Excluir a conta remove seus dados locais e o texto de seus comentários. Restaurar a demonstração substitui todas as alterações pelos exemplos iniciais. Como este é um ambiente local, qualquer pessoa com acesso ao navegador pode acessar seus dados.",
      ],
      [
        "Antes do lançamento",
        "A versão comercial precisará de política final sobre base legal, retenção, direitos do titular, faixa etária, contato do responsável e tratamento por provedores. Estes textos não substituem essa documentação.",
      ],
      [
        "Serviços e arquivos",
        "Imagens, fontes e amostras usadas pela aplicação são servidas junto com o protótipo. Links para fontes externas só são abertos quando você os acessa. Não há analytics ou cookies de publicidade nesta etapa.",
      ],
    ],
  },
};
export function Info({ page = "sobre" }: { page?: string }) {
  const data = texts[page];
  if (!data) return <NotFound />;
  return (
    <div className="page-width content-page info-page">
      <PageHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.intro}
      />
      {data.sections.map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      <Link className="button primary" to="/">
        Continue sua descoberta <ArrowRight />
      </Link>
    </div>
  );
}
type Credit = {
  file: string;
  source: string;
  license: string;
  use: string;
  download?: string;
};
export function Credits() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/assets/credits.json")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setCredits)
      .catch(() => setError(true));
  }, []);
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="Cada obra tem uma história"
        title="Fontes e créditos"
        description="Origem dos arquivos utilizados na demonstração. Fotografias de ambientação não representam as obras catalogadas."
      />
      <InlineNotice>
        Os metadados do catálogo são demonstrativos. Os arquivos de produção,
        traduções, arranjos e gravações devem ser conferidos individualmente
        antes do lançamento.
      </InlineNotice>
      {error ? (
        <p role="alert">
          Não foi possível carregar os créditos. Consulte
          public/assets/credits.json no código-fonte.
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Uso</th>
                <th>Licença / origem</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c.file}>
                  <td>{c.file}</td>
                  <td>{c.use}</td>
                  <td>
                    <a
                      href={c.download || c.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {c.license} <ArrowRight size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">
        Interface: Manrope, SIL Open Font License. Ícones: Phosphor, MIT
        License. Fotografias:{" "}
        <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
          Unsplash License
        </a>
        .
      </p>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="page-width content-page">
      <div className="coming-soon">
        <Sparkle size={50} weight="thin" />
        <span className="eyebrow">404 · Um pequeno desencontro</span>
        <h1>
          O caminho continua
          <br />
          em outro lugar.
        </h1>
        <p>
          Não encontramos esta página. Há outras boas histórias esperando no
          início.
        </p>
        <Link className="button primary" to="/">
          Voltar ao Selectus <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
