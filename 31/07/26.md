# Dossiê de Desenvolvimento - ClicStore
**Data:** 30/07/2026
**Objetivo:** Histórico completo das implementações e resoluções de problemas na landing page de produtos (Foco no Porta Retrato 13x18).

Este documento serve como memória para retomarmos o trabalho de onde paramos, garantindo que todo o contexto seja preservado.

---

## 1. Desafios de Layout e Iframes
*   **Problema Inicial:** A estrutura antiga do HTML da plataforma limitava a criação de um design "Premium".
*   **Tentativa com Iframe:** Tentamos hospedar uma página externa e puxar via `iframe`, mas a plataforma bloqueava a altura automática, quebrando o visual no celular.
*   **Solução Definitiva:** Desenvolvemos um HTML nativo (`codigo_loja_direto.html`) altamente sofisticado, com imagens tratadas, animações de scroll estilo Apple (`.apple-anim` e `.apple-anim-scroll`) e estruturado para rodar perfeitamente no mobile.

## 2. Engenharia Reversa no Tema (CSS Injetado)
Fizemos a inspeção do código da loja (DevTools) e aplicamos CSS customizado para driblar as limitações do tema:
*   **Menu Fixo (Sticky):** Fizemos o cabeçalho acompanhar a rolagem da página.
*   **Botão Dourado:** Mudamos a cor do botão "Comprar" do verde padrão para um dourado premium.
*   **A Caixinha de Quantidade:** A opção de selecionar a quantidade estava oculta na página do produto devido a um código antigo do tema (`.product-amount { display: none !important; }`). Nós anulamos isso apenas para a página interna, permitindo que a quantidade volte a aparecer ao lado do botão comprar.

## 3. Correções de Medidas (Ficha Técnica)
*   **Erro Encontrado:** O HTML antigo estava misturando as medidas do quadro maior (20x25 / total 24x29) no anúncio do quadro menor (13x18).
*   **Correção:** Cruzamos os dados com o anúncio oficial do Mercado Livre e atualizamos a Ficha Técnica para o padrão exato do **13x18** (Tamanho Total: 17x22).
*   **Formato de Venda:** No ML o produto é vendido como "Kit de 10", mas no site adaptamos o texto para venda **Unitária**, mantendo a estratégia do Desconto Progressivo.

## 4. Copywriting e FAQ
*   **Otimização:** Reescrevemos toda a seção de "Dúvidas Frequentes" usando copywriting persuasivo.
*   **Novidades:** Inserimos gatilhos de segurança (Checkout Seguro, Garantia) e adicionamos a nova opção de **Retirada Direto na Fábrica**.

## 5. Vídeos e Imagens
*   **Vídeo:** Testamos rodar um vídeo aberto na página, mas o sistema limitava muito o tamanho. Optamos por usar a solução nativa da plataforma (onde o vídeo abre via botão) para teste.
*   **Imagens:** Substituímos as fotos antigas pelo novo padrão de imagens explicativas (ficha visual) e padronizamos a vitrine de "Cores" (removendo bordas soltas). Corrigimos também as letras borradas no banner da Shopee.

## 6. Pendências e Investigações
*   **Tabela de Desconto Progressivo:** A tabela de porcentagens não aparece nativamente na página do Porta Retratos 13x18, diferente de outros produtos.
*   **Nosso Diagnóstico:** Descobrimos que isso ocorre porque o produto tem **Variações de Cor**. Na Simplo7, quando um produto tem variações, a aba principal de "Números" é bloqueada e a regra de desconto precisa ser configurada individualmente dentro de cada cor na aba Variações, ou através do Aplicativo de Desconto Progressivo.
