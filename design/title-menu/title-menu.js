// Tab switching + host code display for the Firstlight title menu (Formara draft).
(function(){
  const root=document.getElementById('title');if(!root)return;
  root.querySelectorAll('.fl-tab').forEach(t=>t.onclick=()=>{
    root.querySelectorAll('.fl-tab,.fl-pane').forEach(e=>e.classList.toggle('on',e.dataset.pane===t.dataset.pane));
  });
  // Call FL.titleShowCode(code) from the host flow instead of a toast.
  window.FL=window.FL||{};
  FL.titleShowCode=c=>{document.getElementById('hostCodeTxt').textContent=c;document.getElementById('hostCode').classList.remove('hidden');};
  const cp=document.getElementById('copyCode');
  if(cp)cp.onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('hostCodeTxt').textContent);
  const j=document.getElementById('joinIn');if(j)j.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('joinBtn').click();});
})();
