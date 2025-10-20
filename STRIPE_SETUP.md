# Configuração de Métodos de Pagamento Stripe

Este documento explica como configurar os métodos de pagamento no Stripe Dashboard para Portugal.

## Métodos de Pagamento Disponíveis

A aplicação está configurada para aceitar os seguintes métodos de pagamento:

- ✅ **Cartões de Crédito/Débito** (Visa, Mastercard, American Express)
- ✅ **PayPal** (via Stripe Wallet)
- ✅ **Multibanco** (Portugal)
- ✅ **MB WAY** (Portugal)
- ✅ **Apple Pay / Google Pay**

## Como Habilitar os Métodos de Pagamento

### 1. Aceda ao Stripe Dashboard

1. Faça login em https://dashboard.stripe.com
2. Certifique-se de que está no modo **Test** ou **Live** conforme necessário

### 2. Habilitar Multibanco

1. Vá para **Settings** → **Payment methods**
2. Procure por **Multibanco** na lista
3. Clique em **Turn on**
4. Configure as opções:
   - ✅ Enable for: **All customers**
   - ✅ Availability: **Always show**

### 3. Habilitar MB WAY

1. Na mesma página **Payment methods**
2. Procure por **MB WAY**
3. Clique em **Turn on**
4. Configure:
   - ✅ Enable for: **All customers**
   - ✅ Availability: **Always show**

### 4. Habilitar PayPal

1. Na página **Payment methods**
2. Procure por **PayPal** ou **Wallets**
3. Clique em **Turn on**
4. Siga as instruções para conectar a sua conta PayPal Business
5. Configure:
   - ✅ Enable for: **All customers**
   - ✅ Availability: **Always show**

### 5. Verificar Cartões

1. Os cartões geralmente já estão habilitados por padrão
2. Verifique em **Payment methods** se **Cards** está ativo
3. Certifique-se que aceita:
   - ✅ Visa
   - ✅ Mastercard
   - ✅ American Express (opcional)

## Configuração da Conta Stripe

### Informações Necessárias

Para aceitar pagamentos em Portugal, o Stripe precisa de:

1. **Informações da Empresa**:
   - Nome legal da empresa
   - NIF (Número de Identificação Fiscal)
   - Morada da sede

2. **Informação Bancária**:
   - IBAN da conta bancária portuguesa
   - BIC/SWIFT do banco

3. **Documentação**:
   - Documento de identificação do representante legal
   - Comprovativo de morada da empresa

### Ativar Modo Live

1. Complete o processo de verificação em **Settings** → **Account details**
2. Adicione as informações de faturação
3. Configure os webhooks para produção
4. Atualize as chaves de API (STRIPE_SECRET_KEY e VITE_STRIPE_PUBLIC_KEY)

## Testar os Métodos de Pagamento

### Modo Test

No modo Test, use estes dados para simular pagamentos:

**Cartões de Teste**:
- **Sucesso**: 4242 4242 4242 4242
- **Falha (cartão recusado)**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184
- CVV: Qualquer 3 dígitos
- Data: Qualquer data futura

**Multibanco**:
- No modo test, o Multibanco gera uma referência fictícia
- O pagamento pode ser marcado como pago manualmente no dashboard

**MB WAY**:
- Use um número de telefone fictício: +351 910 000 000
- O pagamento pode ser confirmado no dashboard test

**PayPal**:
- Use uma conta PayPal Sandbox
- Configure em https://developer.paypal.com

## Preços dos Métodos de Pagamento (Portugal)

- **Cartões Europeus**: 1.5% + €0.25 por transação
- **Multibanco**: ~1.5% + €0.25 por transação
- **MB WAY**: ~1.5% + €0.25 por transação
- **PayPal**: Taxas padrão de wallet (consulte Stripe pricing)

## Troubleshooting

### Os métodos de pagamento não aparecem

1. ✅ Verifique que os métodos estão **habilitados** no dashboard
2. ✅ Confirme que `automatic_payment_methods` está ativo no código
3. ✅ Certifique-se de que a moeda é **EUR**
4. ✅ Verifique as chaves de API (mode Test vs Live)

### PayPal não aparece

1. ✅ Conecte a conta PayPal Business ao Stripe
2. ✅ Complete a verificação da conta PayPal
3. ✅ Habilite "Wallets" no payment methods

### Multibanco/MB WAY não disponíveis

1. ✅ Estes métodos são específicos de Portugal
2. ✅ A conta Stripe deve estar registada em Portugal ou EU
3. ✅ A moeda deve ser EUR
4. ✅ Contacte o suporte Stripe se não vir as opções

## Recursos Úteis

- **Stripe Portugal**: https://stripe.com/en-pt
- **Documentação Multibanco**: https://docs.stripe.com/payments/multibanco
- **Payment Methods**: https://stripe.com/docs/payments/payment-methods
- **Teste de Cartões**: https://stripe.com/docs/testing
- **Suporte Stripe**: https://support.stripe.com

## Webhooks (Produção)

Quando ativar o modo Live, configure o webhook:

1. Vá para **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://your-domain.replit.app/api/stripe-webhook`
4. Eventos a monitorizar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copie o **Webhook signing secret** e adicione ao secret `STRIPE_WEBHOOK_SECRET`

---

**Nota Importante**: Certifique-se de que todos os métodos de pagamento estão **ativados e configurados** no Stripe Dashboard antes de testar a aplicação. Os métodos só aparecerão no checkout se estiverem habilitados na sua conta Stripe.
