export function stat(label, value, id=""){
  return `<div class="stat"><small>${label}</small><b ${id ? `id="${id}"` : ""}>${value}</b></div>`;
}
export function toast(text){
  const t = document.getElementById("toast");
  t.textContent = text; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1300);
}
export function sparkles(container){
  if(!container || container.childElementCount) return;
  for(let i=0;i<80;i++){
    const s = document.createElement("span"); s.className = "spark";
    s.style.left = Math.random()*100+"%"; s.style.top = Math.random()*100+"%"; s.style.animationDelay = Math.random()*5+"s";
    container.appendChild(s);
  }
}