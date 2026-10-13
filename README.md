# Picture Style Unlocker

Ferramenta local para desbloquear perfis Canon Picture Style (**`.pf3`** e **`.pf2`**) protegidos com a trava *"Disable subsequent editing"*.

Permite reabrir os arquivos no **Canon Picture Style Editor** oficial com total liberdade para editar curvas de tom, matrizes de 6 eixos de cores e tabelas 3D LUT originais.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Windows** (7, 10 ou 11)
- **Node.js** (v16 ou superior)
- **Canon Picture Style Editor** instalado no computador

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/hokusho/unlock-canon-ps.git
   cd unlock-canon-ps
   ```

2. **Inicie o servidor:**
   - Dê dois cliques em `Abrir-Site-Desbloqueador.bat`
   - *Ou execute pelo terminal:*
     ```bash
     npm start
     ```

3. **Acesse no navegador:**
   - [http://localhost:5050](http://localhost:5050)

4. **Desbloqueie o perfil:**
   - Arraste ou selecione seu arquivo `.pf3` ou `.pf2`.
   - Clique em **"Desbloquear Perfil Agora"**.
   - Baixe o perfil gerado e abra normalmente no Canon Picture Style Editor.

---

## 🛠️ Tecnologias Utilizadas
- **Frontend:** HTML5, Vanilla CSS (visual sólido, sem dependências, bilíngue PT/EN), Vanilla JavaScript
- **Backend:** Node.js (HTTP / API de upload e stream)
- **Motor de Desbloqueio:** PowerShell + C# (.NET Reflection interop com bibliotecas nativas Canon `PSEditor.exe` e `DPP4Lib`)

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
