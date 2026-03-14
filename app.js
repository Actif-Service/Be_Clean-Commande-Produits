(function(){
  emailjs.init("UIMYUuF1YijZh1DFI");
})();

function escapeHTML(str){
  if(!str) return "";
  return str.replace(/[&<>"']/g,function(m){
    return({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

const chantiersBEClean=[
{nom:"AKROPOLIS",adresse:"Luitberg, 25 1853 Strombeek-Bever"},
{nom:"APOLLO 95-97",adresse:"Grotexinkellaan, 95-97 1853 Strombeek-Bever"},
{nom:"ECTA",adresse:"Rue de Trèves, 49-51 1040 Etterbeek"},
{nom:"EPHA",adresse:"Rue de Trèves, 49-51 1040 Etterbeek"},
{nom:"ERS",adresse:"Rue de Trèves, 49-51 1040 Etterbeek"},
{nom:"GROENDAL",adresse:"Sint-Annalaan, 74 1800 Vilvoorde"},
{nom:"STONE",adresse:"Steenstraat, 59 1800 Vilvoorde"},
{nom:"BWT",adresse:"Leuvensesteenweg, 633 1930 Zaventem"}
];

const produits=[
{ nom:"Ajax citron", image:"https://actif-service.github.io/Commande-Produits/images/Ajax%20citron.jpg"},
{ nom:"Glass 2000 1 litre", image:"https://actif-service.github.io/Commande-Produits/images/Glass%202000%201%20litre.jpg"},
{ nom:"Sani-day 1 litre", image:"https://actif-service.github.io/Commande-Produits/images/Sani-day%201%20litre.jpg"},
{ nom:"Detarsan 1 litre", image:"https://actif-service.github.io/Commande-Produits/images/Detarsan_1litre.jpg"},
{ nom:"Dreft 1 litre", image:"https://actif-service.github.io/Commande-Produits/images/Dreft%201%20litre.jpg"},
{ nom:"WC Gel avec Javel", image:"https://actif-service.github.io/Commande-Produits/images/WC%20Gel%20avec%20Javel.jpg"},
{ nom:"Gant de ménage Taille S", image:"https://actif-service.github.io/Commande-Produits/images/Gand%20de%20ménage%20Taille%20S.jpg"},
{ nom:"Gant de ménage Taille M", image:"https://actif-service.github.io/Commande-Produits/images/Gand%20de%20ménage%20Taille%20M.jpg"},
{ nom:"Gant de ménage Taille L", image:"https://actif-service.github.io/Commande-Produits/images/Gand%20de%20ménage%20Taille%20L.jpg"}
];

document.addEventListener("DOMContentLoaded",()=>{

const chantierSelect=document.getElementById("chantier");
const produitsContainer=document.getElementById("produits");

chantiersBEClean.forEach(c=>{
const option=document.createElement("option");
option.value=c.nom;
option.textContent=c.nom;
chantierSelect.appendChild(option);
});

produits.forEach(p=>{

const div=document.createElement("div");
div.className="produit";

div.innerHTML=`
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

const input=div.querySelector(".quantite");

div.querySelector(".plus").addEventListener("click",()=>{
input.value=(parseInt(input.value)||0)+1;
});

div.querySelector(".moins").addEventListener("click",()=>{
input.value=Math.max(0,(parseInt(input.value)||0)-1);
});

});

document.getElementById("formCommande").addEventListener("submit",function(e){

e.preventDefault();

const societe="BE Clean";
const chantier=escapeHTML(document.getElementById("chantier").value);
const nom=escapeHTML(document.getElementById("nom").value);
const autre=escapeHTML(document.getElementById("autre").value);

let tableau=`
<table style="width:100%;border-collapse:collapse;font-family:Arial;font-size:14px">
<thead>
<tr style="background:#1976d2;color:white">
<th style="border:1px solid #ccc;padding:10px">Produit</th>
<th style="border:1px solid #ccc;padding:10px">Quantité</th>
</tr>
</thead>
<tbody>
`;

let ligne=0;

document.querySelectorAll(".quantite").forEach(input=>{

if(Number(input.value)>0){

ligne++;
const couleur=ligne%2===0?"#bbdefb":"#ffffff";

tableau+=`
<tr style="background:${couleur}">
<td style="border:1px solid #ccc;padding:10px">${escapeHTML(input.dataset.nom)}</td>
<td style="border:1px solid #ccc;padding:10px">${input.value}</td>
</tr>
`;

}

});

tableau+=`</tbody></table>`;

const messageHTML=`
<h2 style="color:#4CAF50">Commande BE Clean</h2>

<p><b>Chantier :</b> ${chantier}</p>
<p><b>Nom :</b> ${nom}</p>

${tableau}

${autre?`<p><b>Autre demande :</b><br>${autre}</p>`:""}
`;

emailjs.send("service_kt6gmbs","template_53rynh4",{
societe,
chantier,
nom,
commande:messageHTML
}).then(()=>{
alert("Commande envoyée !");
document.getElementById("formCommande").reset();
document.querySelectorAll(".quantite").forEach(i=>i.value=0);
});

});

});
