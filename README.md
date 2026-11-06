# Selectus

Protótipo web responsivo de cultura e comunidade de inspiração cristã, em React, TypeScript, Vite e React Router.

## Executar e verificar

Requer Node.js 22.12 ou superior e npm.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

O servidor de desenvolvimento abre em http://127.0.0.1:5173.

## Experimentar

A demonstração começa com Mariana, membro bonificado. Em **Perfil → Cenários da demonstração**, escolha visitante, gratuito, pagante, bonificado, vencido ou equipe. Cada cenário usa uma conta de exemplo independente. Restaure os dados pelo mesmo painel.

- Acervo: dez áreas, 24 conteúdos iniciais, busca, temas e destaque editorial.
- Obras: curtida e uma reação independentes; coleção automática; progresso por versão; fórum central por obra.
- Amostras: Viagem à Lua (65 segundos, sem trilha adicionada), Dom Casmurro (quatro trechos do capítulo I), Prelúdio em dó maior (síntese original de trecho de Bach) e ampliação das quatro obras de arte.
- Assinatura: gere uma cobrança não pagável e simule confirmação ou vencimento. O mês civil é acrescentado após todo o acesso existente. O ciclo usa America/Sao_Paulo e conserva a âncora do dia nas renovações consecutivas, limitando-a ao último dia do mês.
- Convites: confirme cadastro e abertura autenticada do app em qualquer ordem. Cada qualificação gera dois benefícios únicos de 30 dias. Cadastro vinculado pelo código aguarda abertura simulada do app em Meus convites.
- Equipe: crie, revise, publique e retire conteúdos; cadastre versões e direitos; modere denúncias; altere papéis; consulte pagamentos, indicações, suporte e auditoria.

Para entrar novamente, use um contato existente, como bonificado@exemplo.test. Não há senha nem autenticação real. Cadastro e recuperação são demonstrações sem envio de mensagens.

## Organização

- src/data.ts: catálogo e contas de exemplo.
- src/types.ts: entidades compartilhadas.
- src/services.ts: operações de catálogo, conta, comunidade, concessões, convites e administração.
- src/store.tsx: transações locais, persistência versionada e feedback.
- src/platform.ts: fronteira para recursos do dispositivo, substituível por um adaptador Capacitor.
- src/pages: experiências do membro e da equipe.
- public/assets/credits.json: origem, licença e utilização das mídias.

Não existe API HTTP. Os serviços tipados poderão receber clientes de API. Na evolução para produção, permissões, pagamentos e concessões precisam ser validados no servidor, com autenticação, transações e restrições de unicidade.

## Dados e limites

O estado fica em localStorage, na chave selectus:demo:v1, somente neste navegador. Falhas ao salvar são sinalizadas e a sessão continua. Estado inválido ou de versão desconhecida retorna aos exemplos iniciais.

Visitantes leem fóruns e amostras. Cadastrados curtem, reagem e mantêm coleções. Membros pagos e bonificados têm os mesmos recursos, incluindo participação nos fóruns. Editores cuidam do catálogo; moderadores analisam denúncias; administradores acessam todos os módulos.

O seletor de cenários não é uma barreira de segurança. Use dados fictícios. Não há sincronização entre dispositivos, gateway Pix, lojas, envio de mensagens, uploads, mídia offline ou backend de produção.

As pautas jornalísticas e reflexões estão identificadas como demonstrativas. Fotografias de ambientação não representam as obras catalogadas. Os arquivos usados têm origem em Créditos; o restante do catálogo apresenta fichas sem disponibilizar arquivos não conferidos.

O script scripts/prepare-assets.py baixa as mídias e fontes e produz a amostra musical. Exige Python 3, ffmpeg e internet; não é necessário executá-lo para compilar o app.

O lançamento comercial depende da revisão individual dos arquivos, edições, traduções, gravações e territórios, além dos termos e da política de privacidade finais.

## Validação

Testes automatizados cobrem interações, idempotência, acesso vencido, calendário mensal, pagamentos, convites nas duas ordens, direitos, permissões e moderação. A homologação no navegador usa larguras de 390, 768 e 1440 px, incluindo persistência, mídias, formulários e administração.

## Hospedagem e mobile

O build estático é gerado em dist. public/_redirects fornece fallback das rotas para index.html; configure a mesma regra em outras hospedagens. A prévia privada usa o projeto de .openai/hosting.json.

Configure VITE_PUBLIC_ORIGIN antes do build para mudar a origem dos links de convite. Variáveis Vite são públicas: não coloque segredos nelas.

Capacitor poderá reutilizar o build web e receber adaptadores de armazenamento, compartilhamento e deep links. Projetos Android e iOS, testes em dispositivos, faturamento por canal e publicação nas lojas ficam para a próxima etapa.
