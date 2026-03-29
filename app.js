(function(){
  emailjs.init("UIMYUuF1YijZh1DFI");
})();

function escapeHTML(str){
  if(!str) return "";
  return str.replace(/[&<>"']/g,function(m){
    return({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

const params = new URLSearchParams(window.location.search);
const client = params.get("client");

if(!client){
  document.body.innerHTML = "<h2 style='text-align:center'>Lien invalide</h2>";
  throw new Error("Client manquant");
}

fetch(`configs/${client}.json`)
  .then(res => {
    if (!res.ok) throw new Error("Config introuvable");
    return res.json();
  })
  .then(CONFIG => {
    initApp(CONFIG);
  })
  .catch(() => {
    document.body.innerHTML = "<h2 style='text-align:center'>Configuration introuvable</h2>";
  });

function initApp(CONFIG){
  const { societe, chantiers, produits } = CONFIG;

  document.title = `Commande de produits - ${societe}`;
  document.getElementById("societe").value = societe;

  const chantierSelect = document.getElementById("chantier");
  const produitsContainer = document.getElementById("produits");

  chantiers.forEach(c => {
    const option = document.createElement("option");
    option.value = c.nom;
    option.textContent = c.nom;
    chantierSelect.appendChild(option);
  });

  produits.forEach(p => {
    const div = document.createElement("div");
    div.className = "produit";
    div.innerHTML = `
      <div class="img-container">
        <img src="${p.image}" alt="${p.nom}">
      </div>
      <span>${p.nom}</span>
      <div class="quantite-container">
        <button type="button" class="moins">-</button>
        <input type="number" min="0" value="0" class="quantite" data-nom="${p.nom}">
        <button type="button" class="plus">+</button>
      </div>
    `;
    produitsContainer.appendChild(div);

    const input = div.querySelector(".quantite");

    div.querySelector(".plus").addEventListener("click", () => {
      input.value = (parseInt(input.value) || 0) + 1;
    });

    div.querySelector(".moins").addEventListener("click", () => {
      input.value = Math.max(0, (parseInt(input.value) || 0) - 1);
    });
  });

  document.getElementById("formCommande").addEventListener("submit", async function (e) {
    e.preventDefault();

    const chantier = escapeHTML(document.getElementById("chantier").value);
    const nom = escapeHTML(document.getElementById("nom").value);
    const autre = escapeHTML(document.getElementById("autre").value);

    if(!chantier || !nom){
      alert("Veuillez remplir tous les champs");
      return;
    }

    const maintenant = new Date();
    const date = maintenant.toLocaleDateString("fr-BE");
    const heure = maintenant.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

    // 📄 PDF
    const doc = genererPDF({
      societe,
      chantier,
      nom,
      date,
      heure,
      autre,
      chantiers
    });

    doc.save(`commande_${chantier}.pdf`);

    // 📧 EMAIL
    const messageHTML = `
      <b>Société :</b> ${societe}<br>
      <b>Demandeur :</b> ${nom}<br>
      <b>Chantier :</b> ${chantier}<br><br>
      Commande envoyée.
    `;

    emailjs.send("service_kt6gmbs", "template_53rynh4", {
      societe,
      chantier,
      nom,
      commande: messageHTML
    }).then(() => {
      alert("Commande envoyée !");
      document.getElementById("formCommande").reset();
      document.querySelectorAll(".quantite").forEach(i => i.value = 0);
    });
  });

  // 🧾 PDF DESIGN
  function genererPDF({ societe, chantier, nom, date, heure, autre, chantiers }) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text("Commande de produits", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text(`Société : ${societe}`, 10, 30);
    doc.text(`Demandeur : ${nom}`, 10, 36);

    doc.text(`${date}`, 150, 30);
    doc.text(`${heure}`, 150, 36);

    const chantierData = chantiers.find(c => c.nom === chantier);

    doc.setDrawColor(165, 214, 167);
    doc.setFillColor(240, 255, 240);
    doc.roundedRect(60, 45, 90, 30, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("CHANTIER", 105, 52, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(chantier, 105, 60, { align: "center" });

    if (chantierData?.adresse) {
      doc.setFontSize(9);
      doc.setTextColor(80);
      const adresse = doc.splitTextToSize(chantierData.adresse, 80);
      doc.text(adresse, 105, 68, { align: "center" });
    }

    const produits = [...document.querySelectorAll(".quantite")]
      .filter(input => Number(input.value) > 0)
      .map(input => [input.dataset.nom, input.value]);

    doc.autoTable({
      startY: 85,
      head: [["Produit", "Qté"]],
      body: produits,
      theme: "grid",
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      },
      columnStyles: {
        1: { halign: "center", cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: [205, 230, 255]
      }
    });

    if (autre) {
      const y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("Autre demande :", 10, y);

      const texte = doc.splitTextToSize(autre, 180);
      doc.text(texte, 10, y + 6);
    }

    return doc;
  }
}
