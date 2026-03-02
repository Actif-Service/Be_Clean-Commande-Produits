// 🔹 Protection anti-injection HTML
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// 🔹 Chantiers Clean (nom affiché + adresse envoyée par email)
const chantiersClean = [
  {
    nom: "Résidence Les Lilas",
    adresse: "12 rue des Fleurs, 75010 Paris"
  },
  {
    nom: "Immeuble Horizon",
    adresse: "8 avenue Victor Hugo, 75016 Paris"
  },
  {
    nom: "Bureau Central",
    adresse: "25 boulevard Voltaire, 75011 Paris"
  }
];

// 🔹 Remplissage du menu déroulant
const chantierSelect = document.getElementById("chantier");

chantiersClean.forEach(c => {
  const option = document.createElement("option");
  option.value = c.adresse;      // envoyé dans le mail
  option.textContent = c.nom;    // affiché à l'écran
  chantierSelect.appendChild(option);
});

// 🔹 Produits avec images
const produits = [
  { nom: "Ajax citron", image: "https://actif-service.github.io/Commande-Produits/images/Ajax%20citron.jpg" },
  { nom: "Glass 2000 1 litre", image: "https://actif-service.github.io/Commande-Produits/images/Glass%202000%201%20litre.jpg" },
  { nom: "Sani-day 1 litre", image: "https://actif-service.github.io/Commande-Produits/images/Sani-day%201%20litre.jpg" }
  // 👉 Tu peux remettre toute ta liste complète ici
];

const produitsContainer = document.getElementById("produits");

// 🔹 Affichage produits
produits.forEach(p => {
  const div = document.createElement("div");
  div.className = "produit";

  div.innerHTML = `
    <div class="img-container">
      <img src="${p.image}" alt="${p.nom}">
    </div>
    <span>${p.nom}</span>
    <div class="quantite-container">
      <button class="moins" type="button">-</button>
      <input type="number" min="0" value="0" class="quantite" data-nom="${p.nom}">
      <button class="plus" type="button">+</button>
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

// 🔹 Envoi EmailJS
document.getElementById("formCommande").addEventListener("submit", function(e) {
  e.preventDefault();

  const societe = "Clean";
  const chantier = escapeHTML(document.getElementById("chantier").value.trim());
  const nom = escapeHTML(document.getElementById("nom").value.trim());

  if (!chantier || !nom) {
    return alert("Veuillez sélectionner un chantier et entrer votre nom.");
  }

  let texteCommande = `
  <div style="font-family:Arial,sans-serif;">
    <h2>Nouvelle commande produits</h2>
    <p><strong>Société :</strong> ${societe}</p>
    <p><strong>Adresse chantier :</strong> ${chantier}</p>
    <p><strong>Nom :</strong> ${nom}</p>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; width:100%; margin-top:10px;">
      <tr>
        <th>Produit</th>
        <th>Quantité</th>
      </tr>
  `;

  document.querySelectorAll(".quantite").forEach(input => {
    const qte = Number(input.value);
    if (qte > 0) {
      texteCommande += `
        <tr>
          <td>${escapeHTML(input.dataset.nom)}</td>
          <td style="text-align:center;">${qte}</td>
        </tr>
      `;
    }
  });

  texteCommande += "</table></div>";

  emailjs.send("service_kt6gmbs", "template_53rynh4", {
    societe,
    chantier,
    nom,
    commande: texteCommande
  }).then(() => {
    alert("Commande envoyée avec succès !");
    document.getElementById("formCommande").reset();
    document.querySelectorAll(".quantite").forEach(input => input.value = 0);
  }).catch(() => {
    alert("Erreur lors de l'envoi.");
  });
});
