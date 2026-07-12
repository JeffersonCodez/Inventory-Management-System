/* ======================================================================
   LEDGER — Inventory Management System (Frontend Prototype)
   All data is in-memory mock data. No backend calls are made.
   ====================================================================== */

/* ---------- Icons (lucide-style outline SVG paths) ---------- */
const ICONS = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
  box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  truck:'<path d="M3 7h11v9H3z"/><path d="M14 11h4l3 3v2h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  arrowDown:'<path d="M12 3v14"/><path d="M6 11l6 6 6-6"/><path d="M4 21h16"/>',
  arrowUp:'<path d="M12 21V7"/><path d="M18 13l-6-6-6 6"/><path d="M4 3h16"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v5l3 2"/>',
  chart:'<path d="M4 20V10"/><path d="M11 20V4"/><path d="M18 20v-7"/><path d="M2 20h20"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="18" cy="9" r="2.6"/><path d="M15.5 14.3c2.6.4 4.5 2.5 4.5 5.7"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  x:'<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  alert:'<path d="M12 9v4"/><path d="M10.3 3.9L1.8 18a1.5 1.5 0 0 0 1.3 2.3h17.8a1.5 1.5 0 0 0 1.3-2.3L13.7 3.9a1.5 1.5 0 0 0-2.6 0z"/><path d="M12 16.2h.01"/>',
  chevLeft:'<path d="M15 18l-6-6 6-6"/>',
  chevRight:'<path d="M9 18l6-6-6-6"/>',
  chevDown:'<path d="M6 9l6 6 6-6"/>',
  eye:'<path d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  download:'<path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/>',
  filter:'<path d="M4 4h16l-6.5 8v6l-3 2v-8z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  dollar:'<path d="M12 2v20"/><path d="M17 6.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5 2.2 3 5 3.5 5 1.5 5 3.5-2.2 3.5-5 3.5-5-1.5-5-3.5"/>',
  packageCheck:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M9.5 12l1.8 1.8L15 10"/>',
  packageX:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M9.5 11l3.5 3.5"/><path d="M13 11l-3.5 3.5"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
  mail:'<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  mapPin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/>',
};
function icon(name, cls){ return `<svg class="icon ${cls||''}" viewBox="0 0 24 24">${ICONS[name]||''}</svg>`; }

const NAV = [
  {page:'dashboard', label:'Dashboard', icon:'home'},
  {page:'products', label:'Products', icon:'box'},
  {page:'categories', label:'Categories', icon:'layers'},
  {page:'suppliers', label:'Suppliers', icon:'truck'},
  {page:'stockin', label:'Stock In', icon:'arrowDown'},
  {page:'stockout', label:'Stock Out', icon:'arrowUp'},
  {page:'transactions', label:'Transactions', icon:'history'},
  {page:'reports', label:'Reports', icon:'chart'},
  {page:'users', label:'Users', icon:'users'},
  {page:'settings', label:'Settings', icon:'settings'},
];

/* ---------- Mock Data ---------- */
let categories = [
  {id:1, name:'Office Supplies', description:'Paper, pens, binders and general desk essentials.'},
  {id:2, name:'Electronics', description:'Devices, cables, peripherals and accessories.'},
  {id:3, name:'Cleaning Supplies', description:'Janitorial and sanitation products.'},
  {id:4, name:'Food & Pantry', description:'Break room and pantry consumables.'},
  {id:5, name:'Hardware', description:'Tools, fasteners and maintenance parts.'},
];

let suppliers = [
  {id:1, name:'Northwind Traders', contact:'Elena Cruz', phone:'+1 555 0110', email:'elena@northwind.co', address:'22 Harbor Rd, Cebu City', notes:'Preferred vendor for office supplies. Net 30 terms.'},
  {id:2, name:'Pacific Electronics Co.', contact:'Marco Reyes', phone:'+1 555 0142', email:'marco@pacelec.com', address:'8 Industrial Ave, Mandaue', notes:'Bulk discounts above 50 units.'},
  {id:3, name:'BrightClean Supply', contact:'Ana Bautista', phone:'+1 555 0198', email:'ana@brightclean.ph', address:'14 Market St, Cebu City', notes:'Delivers weekly on Tuesdays.'},
  {id:4, name:'IronWorks Hardware', contact:'Diego Santos', phone:'+1 555 0176', email:'diego@ironworks.co', address:'5 Foundry Ln, Talisay', notes:''},
];

let products = [
  {id:1, sku:'OFC-1001', name:'A4 Copy Paper (Ream)', categoryId:1, supplierId:1, unit:'ream', quantity:140, minStock:50, purchasePrice:3.2, sellingPrice:5.5, dateAdded:'2026-01-14', lastUpdated:'2026-06-20', image:''},
  {id:2, sku:'OFC-1002', name:'Ballpoint Pens (Box of 12)', categoryId:1, supplierId:1, unit:'box', quantity:18, minStock:20, purchasePrice:4.1, sellingPrice:7.0, dateAdded:'2026-01-15', lastUpdated:'2026-06-18', image:''},
  {id:3, sku:'OFC-1003', name:'Ring Binders 2"', categoryId:1, supplierId:1, unit:'pc', quantity:0, minStock:15, purchasePrice:2.8, sellingPrice:5.0, dateAdded:'2026-02-02', lastUpdated:'2026-06-10', image:''},
  {id:4, sku:'ELC-2001', name:'USB-C Cable 1m', categoryId:2, supplierId:2, unit:'pc', quantity:76, minStock:30, purchasePrice:1.9, sellingPrice:6.5, dateAdded:'2026-01-20', lastUpdated:'2026-06-22', image:''},
  {id:5, sku:'ELC-2002', name:'Wireless Mouse', categoryId:2, supplierId:2, unit:'pc', quantity:24, minStock:25, purchasePrice:6.4, sellingPrice:14.0, dateAdded:'2026-02-10', lastUpdated:'2026-06-19', image:''},
  {id:6, sku:'ELC-2003', name:'HDMI Cable 2m', categoryId:2, supplierId:2, unit:'pc', quantity:9, minStock:20, purchasePrice:2.6, sellingPrice:9.0, dateAdded:'2026-02-11', lastUpdated:'2026-06-15', image:''},
  {id:7, sku:'CLN-3001', name:'Multi-Surface Cleaner 1L', categoryId:3, supplierId:3, unit:'bottle', quantity:52, minStock:20, purchasePrice:2.1, sellingPrice:4.2, dateAdded:'2026-01-25', lastUpdated:'2026-06-21', image:''},
  {id:8, sku:'CLN-3002', name:'Paper Towels (6-pack)', categoryId:3, supplierId:3, unit:'pack', quantity:0, minStock:10, purchasePrice:5.0, sellingPrice:8.5, dateAdded:'2026-02-18', lastUpdated:'2026-06-05', image:''},
  {id:9, sku:'FD-4001', name:'Ground Coffee 1kg', categoryId:4, supplierId:3, unit:'bag', quantity:31, minStock:10, purchasePrice:7.5, sellingPrice:12.0, dateAdded:'2026-03-01', lastUpdated:'2026-06-24', image:''},
  {id:10, sku:'FD-4002', name:'Bottled Water (24-pack)', categoryId:4, supplierId:1, unit:'pack', quantity:12, minStock:15, purchasePrice:4.8, sellingPrice:8.0, dateAdded:'2026-03-05', lastUpdated:'2026-06-17', image:''},
  {id:11, sku:'HW-5001', name:'Assorted Screws (500pc)', categoryId:5, supplierId:4, unit:'box', quantity:64, minStock:15, purchasePrice:6.0, sellingPrice:11.0, dateAdded:'2026-03-12', lastUpdated:'2026-06-11', image:''},
  {id:12, sku:'HW-5002', name:'Cordless Drill', categoryId:5, supplierId:4, unit:'pc', quantity:6, minStock:5, purchasePrice:38.0, sellingPrice:69.0, dateAdded:'2026-03-14', lastUpdated:'2026-06-09', image:''},
];

let transactions = [
  {id:1, productId:1, type:'in', quantity:100, date:'2026-06-01', user:'Admin User', notes:'Quarterly restock', supplierId:1},
  {id:2, productId:2, type:'out', quantity:12, date:'2026-06-02', user:'Staff User', reason:'Department use', destination:'Marketing Team'},
  {id:3, productId:4, type:'in', quantity:50, date:'2026-06-03', user:'Admin User', notes:'New shipment', supplierId:2},
  {id:4, productId:6, type:'out', quantity:15, date:'2026-06-05', user:'Staff User', reason:'Client demo', destination:'Sales Team'},
  {id:5, productId:9, type:'in', quantity:20, date:'2026-06-06', user:'Admin User', notes:'Monthly order', supplierId:3},
  {id:6, productId:3, type:'out', quantity:15, date:'2026-06-08', user:'Staff User', reason:'Fully depleted', destination:'Office Pool'},
  {id:7, productId:8, type:'out', quantity:10, date:'2026-06-09', user:'Staff User', reason:'Fully depleted', destination:'Cleaning Crew'},
  {id:8, productId:5, type:'in', quantity:20, date:'2026-06-11', user:'Admin User', notes:'Restock', supplierId:2},
  {id:9, productId:10, type:'out', quantity:8, date:'2026-06-13', user:'Staff User', reason:'Pantry restock', destination:'Break Room'},
  {id:10, productId:12, type:'in', quantity:4, date:'2026-06-15', user:'Admin User', notes:'New stock', supplierId:4},
  {id:11, productId:11, type:'out', quantity:20, date:'2026-05-10', user:'Staff User', reason:'Maintenance job', destination:'Facilities'},
  {id:12, productId:1, type:'out', quantity:40, date:'2026-05-14', user:'Staff User', reason:'Dept. distribution', destination:'All Teams'},
  {id:13, productId:7, type:'in', quantity:40, date:'2026-05-18', user:'Admin User', notes:'Bulk order', supplierId:3},
  {id:14, productId:4, type:'out', quantity:25, date:'2026-04-20', user:'Staff User', reason:'IT rollout', destination:'IT Dept'},
  {id:15, productId:9, type:'out', quantity:9, date:'2026-04-25', user:'Staff User', reason:'Pantry use', destination:'Break Room'},
  {id:16, productId:2, type:'in', quantity:30, date:'2026-04-05', user:'Admin User', notes:'Restock', supplierId:1},
  {id:17, productId:12, type:'in', quantity:5, date:'2026-03-20', user:'Admin User', notes:'Initial stock', supplierId:4},
  {id:18, productId:6, type:'in', quantity:24, date:'2026-03-15', user:'Admin User', notes:'Initial stock', supplierId:2},
];

let users = [
  {id:1, name:'Admin User', email:'admin@ledger.io', role:'admin'},
  {id:2, name:'Staff User', email:'staff@ledger.io', role:'staff'},
  {id:3, name:'Priya Nathan', email:'priya@ledger.io', role:'staff'},
  {id:4, name:'Carlos Mendes', email:'carlos@ledger.io', role:'admin'},
];

let nextId = {product:13, category:6, supplier:5, transaction:19, user:5};

/* ---------- Session / State ---------- */
let session = {role:'admin', name:'Admin User'};
let state = {
  page:'dashboard',
  products:{search:'', category:'all', status:'all', page:1, perPage:6},
  transactions:{search:'', type:'all', page:1, perPage:8},
  reportPreview:null,
};

/* ---------- Auth ---------- */
function doLogin(role){
  session.role = role;
  session.name = role === 'admin' ? 'Admin User' : 'Staff User';
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('user-name').textContent = session.name;
  document.getElementById('user-role').textContent = session.role;
  document.getElementById('user-avatar').textContent = session.name[0];
  document.querySelectorAll('.admin-only').forEach(el=>{
    el.style.display = session.role === 'admin' ? '' : 'none';
  });
  renderSidebarLabels();
  goPage('dashboard');
  toast(`Welcome back, ${session.name.split(' ')[0]}`, 'ok');
}
function doLogout(){
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

function renderSidebarLabels(){
  document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
    const item = NAV.find(n=>n.page===el.dataset.page);
    if(item) el.innerHTML = `${icon(item.icon)}<span>${item.label}</span>`;
  });
}

function toggleSidebar(open){
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('sidebar-scrim').classList.toggle('show', open);
}

/* ---------- Toasts ---------- */
function toast(msg, type){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type||''}`;
  const iconName = type==='err' ? 'alert' : (type==='ok' ? 'check' : 'clock');
  el.innerHTML = `${icon(iconName)}<span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s, transform .3s'; el.style.opacity='0'; el.style.transform='translateX(30px)'; setTimeout(()=>el.remove(), 300); }, 2800);
}

/* ---------- Confirm dialog ---------- */
function confirmDialog(message, onConfirm, title){
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="overlay show" id="confirm-overlay">
      <div class="modal confirm-modal">
        <div class="warn-icon">${icon('alert')}</div>
        <h3>${title || 'Are you sure?'}</h3>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-danger" style="background:var(--danger);color:#fff;border-color:var(--danger);" id="confirm-yes">Delete</button>
        </div>
      </div>
    </div>`;
  document.getElementById('confirm-yes').onclick = ()=>{ onConfirm(); closeModal(); };
}
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }

/* ---------- Navigation ---------- */
const PAGE_META = {
  dashboard:{title:'Dashboard', eyebrow:'Overview'},
  products:{title:'Products', eyebrow:'Inventory'},
  categories:{title:'Categories', eyebrow:'Inventory'},
  suppliers:{title:'Suppliers', eyebrow:'Inventory'},
  stockin:{title:'Stock In', eyebrow:'Movement'},
  stockout:{title:'Stock Out', eyebrow:'Movement'},
  transactions:{title:'Transactions', eyebrow:'Movement'},
  reports:{title:'Reports', eyebrow:'Insights'},
  users:{title:'Users', eyebrow:'Insights'},
  settings:{title:'Settings', eyebrow:'Insights'},
};

function goPage(page){
  if(page === 'users' && session.role !== 'admin'){ toast('Admins only', 'err'); return; }
  state.page = page;
  document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('page-title').textContent = PAGE_META[page].title;
  document.getElementById('page-eyebrow').textContent = PAGE_META[page].eyebrow;
  toggleSidebar(false);
  renderPage(page);
}

function renderPage(page){
  const container = document.getElementById('pages');
  const actions = document.getElementById('topbar-actions');
  actions.innerHTML = '';
  let html = '';
  switch(page){
    case 'dashboard': html = renderDashboard(actions); break;
    case 'products': html = renderProducts(actions); break;
    case 'categories': html = renderCategories(actions); break;
    case 'suppliers': html = renderSuppliers(actions); break;
    case 'stockin': html = renderStockIn(actions); break;
    case 'stockout': html = renderStockOut(actions); break;
    case 'transactions': html = renderTransactions(actions); break;
    case 'reports': html = renderReports(actions); break;
    case 'users': html = renderUsers(actions); break;
    case 'settings': html = renderSettings(actions); break;
  }
  container.innerHTML = `<div class="page active">${html}</div>`;
  afterRender(page);
}

/* ---------- Helpers ---------- */
function catName(id){ const c = categories.find(c=>c.id===id); return c ? c.name : '—'; }
function supName(id){ const s = suppliers.find(s=>s.id===id); return s ? s.name : '—'; }
function prodStatus(p){
  if(p.quantity === 0) return 'out';
  if(p.quantity <= p.minStock) return 'low';
  return 'ok';
}
function statusBadge(status){
  const map = {
    ok:{cls:'badge-ok', label:'In Stock'},
    low:{cls:'badge-warn', label:'Low Stock'},
    out:{cls:'badge-danger', label:'Out of Stock'},
  };
  const m = map[status];
  return `<span class="badge ${m.cls}"><span class="badge-dot"></span>${m.label}</span>`;
}
function fmtMoney(n){ return '$' + Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtDate(d){ return new Date(d+'T00:00:00').toLocaleDateString(undefined,{month:'short', day:'numeric', year:'numeric'}); }
function stockValue(){ return products.reduce((s,p)=>s + p.quantity*p.purchasePrice, 0); }
function isAdmin(){ return session.role === 'admin'; }
function delBtn(onclick){
  return isAdmin() ? `<button class="btn-icon btn-ghost" onclick="${onclick}" title="Delete">${icon('trash')}</button>` : '';
}

/* ---------- Pagination ---------- */
function paginate(arr, page, perPage){
  const total = Math.max(1, Math.ceil(arr.length/perPage));
  page = Math.min(Math.max(1,page), total);
  const start = (page-1)*perPage;
  return {items: arr.slice(start, start+perPage), page, total, count: arr.length};
}
function paginationHTML(page, total, fn){
  if(total<=1) return '';
  let pages = '';
  for(let i=1;i<=total;i++){
    if(total>7 && Math.abs(i-page)>2 && i!==1 && i!==total){
      if(i===2||i===total-1) pages += '<span style="padding:0 6px;color:var(--text-muted);">…</span>';
      continue;
    }
    pages += `<button class="${i===page?'active':''}" onclick="${fn}(${i})">${i}</button>`;
  }
  return `<div class="pagination">
    <span>Page ${page} of ${total}</span>
    <div class="pages">
      <button ${page===1?'disabled':''} onclick="${fn}(${page-1})">${icon('chevLeft')}</button>
      ${pages}
      <button ${page===total?'disabled':''} onclick="${fn}(${page+1})">${icon('chevRight')}</button>
    </div>
  </div>`;
}
function todayStr(){ return new Date().toISOString().slice(0,10); }

/* ======================= DASHBOARD ======================= */
let charts = {};
function renderDashboard(actions){
  const low = products.filter(p=>prodStatus(p)==='low').length;
  const out = products.filter(p=>prodStatus(p)==='out').length;
  const value = stockValue();
  const recentProducts = [...products].sort((a,b)=>b.dateAdded.localeCompare(a.dateAdded)).slice(0,5);
  const recentTx = [...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  return `
  ${(low+out)>0 ? `<div class="low-stock-strip">${icon('alert')}<span><b>${low+out} item${low+out>1?'s':''}</b> need attention — ${low} low on stock, ${out} out of stock.</span><a onclick="goPage('products')">Review products →</a></div>` : ''}
  <div class="grid stat-grid">
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">Total Products</span><div class="stat-icon">${icon('box')}</div></div><div class="stat-value">${products.length}</div><div class="stat-trend">Across ${categories.length} categories</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">Categories</span><div class="stat-icon">${icon('layers')}</div></div><div class="stat-value">${categories.length}</div><div class="stat-trend">Active groupings</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">Low Stock</span><div class="stat-icon warn">${icon('alert')}</div></div><div class="stat-value">${low}</div><div class="stat-trend">Below minimum level</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">Out of Stock</span><div class="stat-icon danger">${icon('packageX')}</div></div><div class="stat-value">${out}</div><div class="stat-trend">Needs reorder</div></div>
    <div class="card stat-card"><div class="stat-top"><span class="stat-label">Stock Value</span><div class="stat-icon ok">${icon('dollar')}</div></div><div class="stat-value">${fmtMoney(value)}</div><div class="stat-trend">At purchase price</div></div>
  </div>
  <div class="grid panel-grid">
    <div class="card">
      <div class="panel-title"><div><h3>Monthly Inventory Movement</h3><div class="sub">Stock in vs. stock out</div></div></div>
      <div style="height:230px;"><canvas id="chart-movement"></canvas></div>
    </div>
    <div class="card">
      <div class="panel-title"><div><h3>Stock Status</h3><div class="sub">Current distribution</div></div></div>
      <div style="height:230px;"><canvas id="chart-status"></canvas></div>
    </div>
  </div>
  <div class="grid panel-grid">
    <div class="card">
      <div class="panel-title"><div><h3>Recently Added Products</h3><div class="sub">Latest catalog entries</div></div><a onclick="goPage('products')" style="font-size:12px;color:var(--gold-light);cursor:pointer;">View all</a></div>
      <div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Qty</th><th>Added</th></tr></thead><tbody>
      ${recentProducts.map(p=>`<tr><td><div class="cell-name">${p.name}</div><div class="cell-sub mono">${p.sku}</div></td><td><span class="tag-cat">${catName(p.categoryId)}</span></td><td class="mono">${p.quantity} ${p.unit}</td><td>${fmtDate(p.dateAdded)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
    <div class="card">
      <div class="panel-title"><div><h3>Recent Transactions</h3><div class="sub">Latest movement</div></div><a onclick="goPage('transactions')" style="font-size:12px;color:var(--gold-light);cursor:pointer;">View all</a></div>
      <div class="table-wrap"><table><thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Date</th></tr></thead><tbody>
      ${recentTx.map(t=>`<tr><td class="cell-name">${prodName(t.productId)}</td><td>${t.type==='in'?'<span class="badge badge-ok"><span class="badge-dot"></span>In</span>':'<span class="badge badge-danger"><span class="badge-dot"></span>Out</span>'}</td><td class="mono">${t.quantity}</td><td>${fmtDate(t.date)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function prodName(id){ const p = products.find(p=>p.id===id); return p ? p.name : '—'; }

function setupDashboardCharts(){
  const counts = {ok:0, low:0, out:0};
  products.forEach(p=> counts[prodStatus(p)]++ );
  const ctx1 = document.getElementById('chart-status');
  if(charts.status) charts.status.destroy();
  charts.status = new Chart(ctx1, {
    type:'doughnut',
    data:{ labels:['In Stock','Low Stock','Out of Stock'],
      datasets:[{data:[counts.ok, counts.low, counts.out], backgroundColor:['#5FA97C','#D4913A','#C4574C'], borderColor:'#1A1A18', borderWidth:3}] },
    options:{ cutout:'68%', maintainAspectRatio:false,
      plugins:{legend:{position:'bottom', labels:{color:'#A6A297', font:{family:'Inter', size:11}, padding:14, usePointStyle:true, pointStyle:'circle'}}} }
  });

  const months = {};
  transactions.forEach(t=>{ const m = t.date.slice(0,7); if(!months[m]) months[m]={in:0,out:0}; months[m][t.type]+=t.quantity; });
  const sortedMonths = Object.keys(months).sort().slice(-6);
  const labels = sortedMonths.map(m=>{ const [y,mo]=m.split('-'); return new Date(Number(y),Number(mo)-1,1).toLocaleDateString(undefined,{month:'short'}); });
  const ctx2 = document.getElementById('chart-movement');
  if(charts.movement) charts.movement.destroy();
  charts.movement = new Chart(ctx2, {
    type:'bar',
    data:{ labels, datasets:[
      {label:'Stock In', data: sortedMonths.map(m=>months[m].in), backgroundColor:'#D4AF37', borderRadius:5, maxBarThickness:22},
      {label:'Stock Out', data: sortedMonths.map(m=>months[m].out), backgroundColor:'#4A4740', borderRadius:5, maxBarThickness:22},
    ]},
    options:{ maintainAspectRatio:false,
      scales:{ x:{grid:{display:false}, ticks:{color:'#A6A297', font:{family:'Inter', size:11}}},
               y:{grid:{color:'#232220'}, ticks:{color:'#A6A297', font:{family:'Inter', size:11}}} },
      plugins:{legend:{position:'bottom', labels:{color:'#A6A297', font:{family:'Inter', size:11}, usePointStyle:true, pointStyle:'circle'}}} }
  });
}

/* ======================= PRODUCTS ======================= */
function renderProducts(actions){
  actions.innerHTML = `<button class="btn btn-gold" onclick="openProductModal()">${icon('plus')} Add Product</button>`;
  return `
    <div class="toolbar">
      <div class="search-box">${icon('search')}<input type="text" placeholder="Search name or SKU…" value="${state.products.search}" oninput="state.products.search=this.value; state.products.page=1; updateProductsTable();"></div>
      <select onchange="state.products.category=this.value; state.products.page=1; updateProductsTable();">
        <option value="all">All Categories</option>
        ${categories.map(c=>`<option value="${c.id}" ${state.products.category===String(c.id)?'selected':''}>${c.name}</option>`).join('')}
      </select>
      <div class="chip-list">
        ${['all','ok','low','out'].map(s=>`<button class="filter-chip ${state.products.status===s?'active':''}" onclick="state.products.status='${s}'; state.products.page=1; updateProductsTable();">${s==='all'?'All':statusLabel(s)}</button>`).join('')}
      </div>
    </div>
    <div class="card" style="padding:0;"><div id="products-table-region"></div></div>
  `;
}
function updateProductsTable(){
  const list = products.filter(p=>{
    const s = state.products.search.toLowerCase();
    const matchesSearch = !s || p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s);
    const matchesCat = state.products.category==='all' || String(p.categoryId)===String(state.products.category);
    const matchesStatus = state.products.status==='all' || prodStatus(p)===state.products.status;
    return matchesSearch && matchesCat && matchesStatus;
  });
  const {items, page, total} = paginate(list, state.products.page, state.products.perPage);
  state.products.page = page;
  const region = document.getElementById('products-table-region');
  if(!region) return;
  region.innerHTML = `
    <div class="table-wrap" style="padding:18px 18px 0;">
    <table><thead><tr><th>Product</th><th>Category</th><th>Supplier</th><th>Qty</th><th>Min</th><th>Purchase</th><th>Selling</th><th>Status</th><th></th></tr></thead>
    <tbody>
    ${items.length? items.map(p=>`
      <tr>
        <td><div class="cell-name">${p.name}</div><div class="cell-sub mono">${p.sku}</div></td>
        <td><span class="tag-cat">${catName(p.categoryId)}</span></td>
        <td>${supName(p.supplierId)}</td>
        <td class="mono">${p.quantity} ${p.unit}</td>
        <td class="mono">${p.minStock}</td>
        <td class="mono">${fmtMoney(p.purchasePrice)}</td>
        <td class="mono">${fmtMoney(p.sellingPrice)}</td>
        <td>${statusBadge(prodStatus(p))}</td>
        <td><div class="row-actions">
          <button class="btn-icon btn-ghost" onclick="openProductDetail(${p.id})" title="View">${icon('eye')}</button>
          <button class="btn-icon btn-ghost" onclick="openProductModal(${p.id})" title="Edit">${icon('edit')}</button>
          ${delBtn(`deleteProduct(${p.id})`)}
        </div></td>
      </tr>`).join('') : `<tr><td colspan="9"><div class="empty-state">${icon('box')}<p>No products match your filters</p></div></td></tr>`}
    </tbody></table></div>
    <div style="padding:0 18px 18px;">${paginationHTML(page, total, 'changeProductsPage')}</div>
  `;
}
function changeProductsPage(p){ state.products.page = p; updateProductsTable(); }

function openProductModal(id){
  const editing = !!id;
  const p = editing ? products.find(x=>x.id===id) : {sku:'',name:'',categoryId:categories[0].id,supplierId:suppliers[0].id,unit:'pc',quantity:0,minStock:5,purchasePrice:0,sellingPrice:0,image:''};
  document.getElementById('modal-root').innerHTML = `
  <div class="overlay show" onclick="if(event.target===this) closeModal()"><div class="modal">
    <div class="modal-head"><h3>${editing?'Edit Product':'Add Product'}</h3><button class="close-x" onclick="closeModal()">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="product-form" onsubmit="submitProductForm(event, ${editing?id:'null'})">
        <div class="form-section-title">Basics</div>
        <div class="form-row">
          <div class="field"><label>Product Name</label><input id="p-name" required value="${p.name}"></div>
          <div class="field"><label>SKU</label><input id="p-sku" required value="${p.sku}"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Category</label><select id="p-category">${categories.map(c=>`<option value="${c.id}" ${c.id===p.categoryId?'selected':''}>${c.name}</option>`).join('')}</select></div>
          <div class="field"><label>Supplier</label><select id="p-supplier">${suppliers.map(s=>`<option value="${s.id}" ${s.id===p.supplierId?'selected':''}>${s.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-section-title">Stock</div>
        <div class="form-row">
          <div class="field"><label>Unit</label><input id="p-unit" required value="${p.unit}" placeholder="pc, box, ream…"></div>
          <div class="field"><label>Quantity</label><input id="p-qty" type="number" min="0" required value="${p.quantity}"></div>
        </div>
        <div class="field"><label>Minimum Stock Level</label><input id="p-min" type="number" min="0" required value="${p.minStock}"></div>
        <div class="form-section-title">Pricing</div>
        <div class="form-row">
          <div class="field"><label>Purchase Price</label><input id="p-purchase" type="number" min="0" step="0.01" required value="${p.purchasePrice}"></div>
          <div class="field"><label>Selling Price</label><input id="p-selling" type="number" min="0" step="0.01" required value="${p.sellingPrice}"></div>
        </div>
        <div class="form-section-title">Media</div>
        <div class="field"><label>Product Image URL (optional)</label><input id="p-image" value="${p.image}" placeholder="https://…"></div>
      </form>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="document.getElementById('product-form').requestSubmit()">${icon('check')} ${editing?'Save Changes':'Add Product'}</button></div>
  </div></div>`;
}
function submitProductForm(e, id){
  e.preventDefault();
  const data = {
    name: document.getElementById('p-name').value.trim(),
    sku: document.getElementById('p-sku').value.trim(),
    categoryId: Number(document.getElementById('p-category').value),
    supplierId: Number(document.getElementById('p-supplier').value),
    unit: document.getElementById('p-unit').value.trim(),
    quantity: Number(document.getElementById('p-qty').value),
    minStock: Number(document.getElementById('p-min').value),
    purchasePrice: Number(document.getElementById('p-purchase').value),
    sellingPrice: Number(document.getElementById('p-selling').value),
    image: document.getElementById('p-image').value.trim(),
  };
  if(!data.name || !data.sku){ toast('Name and SKU are required', 'err'); return; }
  if(id){
    Object.assign(products.find(x=>x.id===id), data, {lastUpdated: todayStr()});
    toast('Product updated', 'ok');
  } else {
    products.push({id:nextId.product++, ...data, dateAdded:todayStr(), lastUpdated:todayStr()});
    toast('Product added', 'ok');
  }
  closeModal();
  renderPage('products');
}
function deleteProduct(id){
  const p = products.find(x=>x.id===id);
  confirmDialog(`This will permanently remove "${p.name}" from the catalog.`, ()=>{
    products = products.filter(x=>x.id!==id);
    toast('Product deleted', 'ok');
    renderPage('products');
  }, 'Delete this product?');
}
function openProductDetail(id){
  const p = products.find(x=>x.id===id);
  document.getElementById('modal-root').innerHTML = `
  <div class="overlay show" onclick="if(event.target===this) closeModal()"><div class="modal">
    <div class="modal-head"><h3>${p.name}</h3><button class="close-x" onclick="closeModal()">${icon('x')}</button></div>
    <div class="modal-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span class="mono" style="color:var(--text-secondary);">${p.sku}</span>
        ${statusBadge(prodStatus(p))}
      </div>
      <div class="two-col" style="margin-bottom:0;gap:12px;">
        <div><div class="cell-sub">Category</div><div class="cell-name">${catName(p.categoryId)}</div></div>
        <div><div class="cell-sub">Supplier</div><div class="cell-name">${supName(p.supplierId)}</div></div>
        <div><div class="cell-sub">Quantity</div><div class="cell-name mono">${p.quantity} ${p.unit}</div></div>
        <div><div class="cell-sub">Minimum Stock</div><div class="cell-name mono">${p.minStock} ${p.unit}</div></div>
        <div><div class="cell-sub">Purchase Price</div><div class="cell-name mono">${fmtMoney(p.purchasePrice)}</div></div>
        <div><div class="cell-sub">Selling Price</div><div class="cell-name mono">${fmtMoney(p.sellingPrice)}</div></div>
        <div><div class="cell-sub">Date Added</div><div class="cell-name">${fmtDate(p.dateAdded)}</div></div>
        <div><div class="cell-sub">Last Updated</div><div class="cell-name">${fmtDate(p.lastUpdated)}</div></div>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;"><span class="cell-sub">Total Stock Value</span><span class="mono" style="color:var(--gold-light);font-weight:600;">${fmtMoney(p.quantity*p.purchasePrice)}</span></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Close</button><button class="btn btn-gold" onclick="closeModal(); openProductModal(${p.id});">${icon('edit')} Edit</button></div>
  </div></div>`;
}

/* ======================= CATEGORIES ======================= */
function renderCategories(actions){
  actions.innerHTML = `<button class="btn btn-gold" onclick="openCategoryModal()">${icon('plus')} Add Category</button>`;
  return `<div class="grid entity-grid">
    ${categories.map(c=>{
      const count = products.filter(p=>p.categoryId===c.id).length;
      return `<div class="card entity-card">
        <div class="entity-head">
          <div class="entity-icon">${icon('layers')}</div>
          <div class="row-actions">
            <button class="btn-icon btn-ghost" onclick="openCategoryModal(${c.id})" title="Edit">${icon('edit')}</button>
            ${delBtn(`deleteCategory(${c.id})`)}
          </div>
        </div>
        <div><div class="entity-name">${c.name}</div><div class="entity-meta">${count} product${count!==1?'s':''}</div></div>
        <div class="entity-desc">${c.description||'No description'}</div>
      </div>`;
    }).join('')}
  </div>`;
}
function openCategoryModal(id){
  const editing = !!id;
  const c = editing ? categories.find(x=>x.id===id) : {name:'', description:''};
  document.getElementById('modal-root').innerHTML = `
  <div class="overlay show" onclick="if(event.target===this) closeModal()"><div class="modal" style="max-width:440px;">
    <div class="modal-head"><h3>${editing?'Edit Category':'Add Category'}</h3><button class="close-x" onclick="closeModal()">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="cat-form" onsubmit="submitCategoryForm(event, ${editing?id:'null'})">
        <div class="field"><label>Category Name</label><input id="c-name" required value="${c.name}"></div>
        <div class="field"><label>Description</label><textarea id="c-desc" rows="3">${c.description}</textarea></div>
      </form>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="document.getElementById('cat-form').requestSubmit()">${icon('check')} ${editing?'Save Changes':'Add Category'}</button></div>
  </div></div>`;
}
function submitCategoryForm(e,id){
  e.preventDefault();
  const name = document.getElementById('c-name').value.trim();
  const description = document.getElementById('c-desc').value.trim();
  if(!name){ toast('Category name is required','err'); return; }
  if(id){ const c=categories.find(x=>x.id===id); c.name=name; c.description=description; toast('Category updated','ok'); }
  else { categories.push({id:nextId.category++, name, description}); toast('Category added','ok'); }
  closeModal(); renderPage('categories');
}
function deleteCategory(id){
  if(products.some(p=>p.categoryId===id)){ toast('Cannot delete — products are assigned to this category', 'err'); return; }
  confirmDialog('This will permanently remove the category.', ()=>{
    categories = categories.filter(x=>x.id!==id); toast('Category deleted','ok'); renderPage('categories');
  }, 'Delete this category?');
}

/* ======================= SUPPLIERS ======================= */
function renderSuppliers(actions){
  actions.innerHTML = `<button class="btn btn-gold" onclick="openSupplierModal()">${icon('plus')} Add Supplier</button>`;
  return `<div class="grid entity-grid">
    ${suppliers.map(s=>{
      const count = products.filter(p=>p.supplierId===s.id).length;
      return `<div class="card entity-card">
        <div class="entity-head">
          <div class="entity-icon">${icon('truck')}</div>
          <div class="row-actions">
            <button class="btn-icon btn-ghost" onclick="openSupplierModal(${s.id})" title="Edit">${icon('edit')}</button>
            ${delBtn(`deleteSupplier(${s.id})`)}
          </div>
        </div>
        <div><div class="entity-name">${s.name}</div><div class="entity-meta">${count} product${count!==1?'s':''} supplied</div></div>
        <div class="entity-desc">
          <div style="display:flex;gap:7px;align-items:center;margin-bottom:5px;">${icon('users')}<span>${s.contact||'—'}</span></div>
          <div style="display:flex;gap:7px;align-items:center;margin-bottom:5px;">${icon('phone')}<span>${s.phone||'—'}</span></div>
          <div style="display:flex;gap:7px;align-items:center;margin-bottom:5px;">${icon('mail')}<span>${s.email||'—'}</span></div>
          <div style="display:flex;gap:7px;align-items:center;">${icon('mapPin')}<span>${s.address||'—'}</span></div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
function openSupplierModal(id){
  const editing = !!id;
  const s = editing ? suppliers.find(x=>x.id===id) : {name:'',contact:'',phone:'',email:'',address:'',notes:''};
  document.getElementById('modal-root').innerHTML = `
  <div class="overlay show" onclick="if(event.target===this) closeModal()"><div class="modal">
    <div class="modal-head"><h3>${editing?'Edit Supplier':'Add Supplier'}</h3><button class="close-x" onclick="closeModal()">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="sup-form" onsubmit="submitSupplierForm(event, ${editing?id:'null'})">
        <div class="form-row">
          <div class="field"><label>Supplier Name</label><input id="s-name" required value="${s.name}"></div>
          <div class="field"><label>Contact Person</label><input id="s-contact" value="${s.contact}"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Phone</label><input id="s-phone" value="${s.phone}"></div>
          <div class="field"><label>Email</label><input id="s-email" type="email" value="${s.email}"></div>
        </div>
        <div class="field"><label>Address</label><input id="s-address" value="${s.address}"></div>
        <div class="field"><label>Notes</label><textarea id="s-notes" rows="2">${s.notes}</textarea></div>
      </form>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="document.getElementById('sup-form').requestSubmit()">${icon('check')} ${editing?'Save Changes':'Add Supplier'}</button></div>
  </div></div>`;
}
function submitSupplierForm(e,id){
  e.preventDefault();
  const data = {
    name: document.getElementById('s-name').value.trim(),
    contact: document.getElementById('s-contact').value.trim(),
    phone: document.getElementById('s-phone').value.trim(),
    email: document.getElementById('s-email').value.trim(),
    address: document.getElementById('s-address').value.trim(),
    notes: document.getElementById('s-notes').value.trim(),
  };
  if(!data.name){ toast('Supplier name is required','err'); return; }
  if(id){ Object.assign(suppliers.find(x=>x.id===id), data); toast('Supplier updated','ok'); }
  else { suppliers.push({id:nextId.supplier++, ...data}); toast('Supplier added','ok'); }
  closeModal(); renderPage('suppliers');
}
function deleteSupplier(id){
  if(products.some(p=>p.supplierId===id)){ toast('Cannot delete — products reference this supplier', 'err'); return; }
  confirmDialog('This will permanently remove the supplier.', ()=>{
    suppliers = suppliers.filter(x=>x.id!==id); toast('Supplier deleted','ok'); renderPage('suppliers');
  }, 'Delete this supplier?');
}

/* ======================= STOCK IN ======================= */
function renderStockIn(actions){
  actions.innerHTML='';
  const recent = transactions.filter(t=>t.type==='in').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  return `
  <div class="grid" style="grid-template-columns:.9fr 1.3fr;gap:16px;">
    <div class="card">
      <div class="panel-title"><h3>Receive Inventory</h3></div>
      <form onsubmit="submitStockIn(event)">
        <div class="field"><label>Product</label><select id="si-product" required>${products.map(p=>`<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}</select></div>
        <div class="form-row">
          <div class="field"><label>Quantity</label><input type="number" id="si-qty" min="1" required placeholder="0"></div>
          <div class="field"><label>Date</label><input type="date" id="si-date" value="${todayStr()}" required></div>
        </div>
        <div class="field"><label>Supplier</label><select id="si-supplier" required>${suppliers.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
        <div class="field"><label>Notes</label><textarea id="si-notes" rows="2" placeholder="Optional notes"></textarea></div>
        <button class="btn btn-gold btn-block" type="submit" style="margin-top:4px;">${icon('arrowDown')} Record Stock In</button>
      </form>
    </div>
    <div class="card">
      <div class="panel-title"><div><h3>Recent Stock In</h3><div class="sub">Latest receipts</div></div></div>
      <div class="table-wrap"><table><thead><tr><th>Product</th><th>Qty</th><th>Supplier</th><th>Date</th><th>User</th></tr></thead>
      <tbody>${stockInRows(recent)}</tbody></table></div>
    </div>
  </div>`;
}
function stockInRows(list){
  return list.length ? list.map(t=>`<tr><td class="cell-name">${prodName(t.productId)}</td><td class="mono" style="color:var(--success);">+${t.quantity}</td><td>${supName(t.supplierId)}</td><td>${fmtDate(t.date)}</td><td>${t.user}</td></tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">${icon('arrowDown')}<p>No stock-in records yet</p></div></td></tr>`;
}
function submitStockIn(e){
  e.preventDefault();
  const productId = Number(document.getElementById('si-product').value);
  const qty = Number(document.getElementById('si-qty').value);
  const supplierId = Number(document.getElementById('si-supplier').value);
  const date = document.getElementById('si-date').value;
  const notes = document.getElementById('si-notes').value.trim();
  if(!qty || qty<=0){ toast('Enter a valid quantity', 'err'); return; }
  const product = products.find(p=>p.id===productId);
  product.quantity += qty;
  product.lastUpdated = date;
  transactions.unshift({id:nextId.transaction++, productId, type:'in', quantity:qty, date, user:session.name, notes, supplierId});
  toast(`Stock in recorded for ${product.name}`, 'ok');
  renderPage('stockin');
}

/* ======================= STOCK OUT ======================= */
function renderStockOut(actions){
  actions.innerHTML='';
  const recent = transactions.filter(t=>t.type==='out').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  return `
  <div class="grid" style="grid-template-columns:.9fr 1.3fr;gap:16px;">
    <div class="card">
      <div class="panel-title"><h3>Dispatch Inventory</h3></div>
      <form onsubmit="submitStockOut(event)">
        <div class="field"><label>Product</label><select id="so-product" required onchange="updateStockOutHint()">${products.map(p=>`<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}</select></div>
        <div class="form-row">
          <div class="field"><label>Quantity</label><input type="number" id="so-qty" min="1" required placeholder="0"></div>
          <div class="field"><label>Date</label><input type="date" id="so-date" value="${todayStr()}" required></div>
        </div>
        <div class="field"><label>Reason</label><select id="so-reason"><option>Department use</option><option>Fully depleted</option><option>Damaged / expired</option><option>Client demo</option><option>Maintenance job</option><option>Other</option></select></div>
        <div class="field"><label>Destination / User</label><input type="text" id="so-dest" placeholder="e.g. Marketing Team" required></div>
        <div class="field"><label>Notes</label><textarea id="so-notes" rows="2" placeholder="Optional notes"></textarea></div>
        <div class="hint" id="so-hint"></div>
        <button class="btn btn-gold btn-block" type="submit" style="margin-top:6px;">${icon('arrowUp')} Record Stock Out</button>
      </form>
    </div>
    <div class="card">
      <div class="panel-title"><div><h3>Recent Stock Out</h3><div class="sub">Latest dispatches</div></div></div>
      <div class="table-wrap"><table><thead><tr><th>Product</th><th>Qty</th><th>Reason</th><th>Destination</th><th>Date</th></tr></thead>
      <tbody>${stockOutRows(recent)}</tbody></table></div>
    </div>
  </div>`;
}
function stockOutRows(list){
  return list.length? list.map(t=>`<tr><td class="cell-name">${prodName(t.productId)}</td><td class="mono" style="color:var(--danger);">-${t.quantity}</td><td>${t.reason||'—'}</td><td>${t.destination||'—'}</td><td>${fmtDate(t.date)}</td></tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">${icon('arrowUp')}<p>No stock-out records yet</p></div></td></tr>`;
}
function updateStockOutHint(){
  const el = document.getElementById('so-product');
  if(!el) return;
  const p = products.find(p=>p.id===Number(el.value));
  const hint = document.getElementById('so-hint');
  if(hint) hint.textContent = p ? `Available: ${p.quantity} ${p.unit}` : '';
}
function submitStockOut(e){
  e.preventDefault();
  const productId = Number(document.getElementById('so-product').value);
  const qty = Number(document.getElementById('so-qty').value);
  const reason = document.getElementById('so-reason').value;
  const dest = document.getElementById('so-dest').value.trim();
  const date = document.getElementById('so-date').value;
  const notes = document.getElementById('so-notes').value.trim();
  const product = products.find(p=>p.id===productId);
  if(!qty || qty<=0){ toast('Enter a valid quantity', 'err'); return; }
  if(qty > product.quantity){ toast(`Only ${product.quantity} ${product.unit} available`, 'err'); return; }
  product.quantity -= qty;
  product.lastUpdated = date;
  transactions.unshift({id:nextId.transaction++, productId, type:'out', quantity:qty, date, user:session.name, notes, reason, destination:dest});
  toast(`Stock out recorded for ${product.name}`, 'ok');
  renderPage('stockout');
}

/* ======================= TRANSACTIONS ======================= */
function renderTransactions(actions){
  actions.innerHTML='';
  return `
    <div class="toolbar">
      <div class="search-box">${icon('search')}<input type="text" placeholder="Search product…" value="${state.transactions.search}" oninput="state.transactions.search=this.value; state.transactions.page=1; updateTransactionsTable();"></div>
      <div class="chip-list">
        ${['all','in','out'].map(t=>`<button class="filter-chip ${state.transactions.type===t?'active':''}" onclick="state.transactions.type='${t}'; state.transactions.page=1; updateTransactionsTable();">${t==='all'?'All':(t==='in'?'Stock In':'Stock Out')}</button>`).join('')}
      </div>
    </div>
    <div class="card" style="padding:0;"><div id="transactions-table-region"></div></div>
  `;
}
function updateTransactionsTable(){
  const list = [...transactions].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>{
    const s = state.transactions.search.toLowerCase();
    const matchesSearch = !s || prodName(t.productId).toLowerCase().includes(s);
    const matchesType = state.transactions.type==='all' || t.type===state.transactions.type;
    return matchesSearch && matchesType;
  });
  const {items, page, total} = paginate(list, state.transactions.page, state.transactions.perPage);
  state.transactions.page = page;
  const region = document.getElementById('transactions-table-region');
  if(!region) return;
  region.innerHTML = `
    <div class="table-wrap" style="padding:18px 18px 0;">
    <table><thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Date</th><th>User</th><th>Details</th></tr></thead>
    <tbody>
    ${items.length? items.map(t=>`
      <tr>
        <td class="cell-name">${prodName(t.productId)}</td>
        <td>${t.type==='in'?'<span class="badge badge-ok"><span class="badge-dot"></span>Stock In</span>':'<span class="badge badge-danger"><span class="badge-dot"></span>Stock Out</span>'}</td>
        <td class="mono" style="color:${t.type==='in'?'var(--success)':'var(--danger)'};">${t.type==='in'?'+':'-'}${t.quantity}</td>
        <td>${fmtDate(t.date)}</td>
        <td>${t.user}</td>
        <td class="cell-sub">${t.type==='in' ? `From ${supName(t.supplierId)}${t.notes?' · '+t.notes:''}` : `${t.reason||''}${t.destination?' → '+t.destination:''}`}</td>
      </tr>`).join('') : `<tr><td colspan="6"><div class="empty-state">${icon('history')}<p>No transactions match your filters</p></div></td></tr>`}
    </tbody></table></div>
    <div style="padding:0 18px 18px;">${paginationHTML(page, total, 'changeTransactionsPage')}</div>
  `;
}
function changeTransactionsPage(p){ state.transactions.page = p; updateTransactionsTable(); }

/* ======================= REPORTS ======================= */
let currentReport = null;
function renderReports(actions){
  actions.innerHTML='';
  const defs = [
    {type:'inventory', title:'Current Inventory', sub:'Full product listing', icn:'box'},
    {type:'low', title:'Low Stock Report', sub:'Below minimum level', icn:'alert'},
    {type:'out', title:'Out of Stock Report', sub:'Zero quantity items', icn:'packageX'},
    {type:'stockin', title:'Stock In Report', sub:'Receiving history', icn:'arrowDown'},
    {type:'stockout', title:'Stock Out Report', sub:'Dispatch history', icn:'arrowUp'},
    {type:'value', title:'Inventory Value', sub:'Cost & revenue potential', icn:'dollar'},
  ];
  return `
    <div class="report-buttons">
      ${defs.map(d=>`<button class="report-btn" onclick="showReport('${d.type}')"><div class="r-icon">${icon(d.icn)}</div><div class="r-title">${d.title}</div><div class="r-sub">${d.sub}</div></button>`).join('')}
    </div>
    <div id="report-preview-region">
      <div class="card"><div class="empty-state">${icon('chart')}<p>Select a report above to preview and export it</p></div></div>
    </div>
  `;
}
function reportData(type){
  switch(type){
    case 'inventory': return { title:'Current Inventory',
      headers:['SKU','Product','Category','Supplier','Quantity','Unit','Status','Stock Value'],
      rows: products.map(p=>[p.sku,p.name,catName(p.categoryId),supName(p.supplierId),p.quantity,p.unit, statusLabel(prodStatus(p)), (p.quantity*p.purchasePrice).toFixed(2)]) };
    case 'low': return { title:'Low Stock Report',
      headers:['SKU','Product','Category','Quantity','Min Stock','Supplier'],
      rows: products.filter(p=>prodStatus(p)==='low').map(p=>[p.sku,p.name,catName(p.categoryId),p.quantity,p.minStock,supName(p.supplierId)]) };
    case 'out': return { title:'Out of Stock Report',
      headers:['SKU','Product','Category','Supplier','Last Updated'],
      rows: products.filter(p=>prodStatus(p)==='out').map(p=>[p.sku,p.name,catName(p.categoryId),supName(p.supplierId),p.lastUpdated]) };
    case 'stockin': return { title:'Stock In Report',
      headers:['Date','Product','Quantity','Supplier','User','Notes'],
      rows: transactions.filter(t=>t.type==='in').sort((a,b)=>b.date.localeCompare(a.date)).map(t=>[t.date, prodName(t.productId), t.quantity, supName(t.supplierId), t.user, t.notes||'']) };
    case 'stockout': return { title:'Stock Out Report',
      headers:['Date','Product','Quantity','Reason','Destination','User'],
      rows: transactions.filter(t=>t.type==='out').sort((a,b)=>b.date.localeCompare(a.date)).map(t=>[t.date, prodName(t.productId), t.quantity, t.reason||'', t.destination||'', t.user]) };
    case 'value': return { title:'Inventory Value Report',
      headers:['SKU','Product','Quantity','Purchase Price','Selling Price','Stock Value','Potential Revenue'],
      rows: products.map(p=>[p.sku,p.name,p.quantity,p.purchasePrice.toFixed(2),p.sellingPrice.toFixed(2),(p.quantity*p.purchasePrice).toFixed(2),(p.quantity*p.sellingPrice).toFixed(2)]) };
  }
}
function statusLabel(s){ return {ok:'In Stock', low:'Low Stock', out:'Out of Stock'}[s]; }
function showReport(type){
  state.reportPreview = type;
  currentReport = reportData(type);
  const region = document.getElementById('report-preview-region');
  if(!region) return;
  region.innerHTML = `
    <div class="card">
      <div class="panel-title">
        <div><h3>${currentReport.title}</h3><div class="sub">${currentReport.rows.length} record${currentReport.rows.length!==1?'s':''}</div></div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold btn-sm" onclick="downloadCurrentReportCSV()">${icon('download')} CSV</button>
          <button class="btn btn-ghost btn-sm" onclick="exportUnavailable('PDF')">${icon('file')} PDF</button>
          <button class="btn btn-ghost btn-sm" onclick="exportUnavailable('Excel')">${icon('file')} Excel</button>
        </div>
      </div>
      <div class="table-wrap"><table><thead><tr>${currentReport.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
      ${currentReport.rows.length ? currentReport.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${currentReport.headers.length}" style="text-align:center;color:var(--text-muted);padding:30px;">No records</td></tr>`}
      </tbody></table></div>
    </div>`;
}
function downloadCurrentReportCSV(){
  if(!currentReport) return;
  downloadCSV(currentReport.title.replace(/\s+/g,'_')+'.csv', currentReport.headers, currentReport.rows);
}
function exportUnavailable(type){ toast(`${type} export is generated server-side in the full application`, 'ok'); }
function downloadCSV(filename, headers, rows){
  const esc = v => `"${String(v).replace(/"/g,'""')}"`;
  const csv = [headers.map(esc).join(','), ...rows.map(r=>r.map(esc).join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast(`${filename} downloaded`, 'ok');
}

/* ======================= USERS ======================= */
function renderUsers(actions){
  actions.innerHTML = isAdmin() ? `<button class="btn btn-gold" onclick="openUserModal()">${icon('plus')} Add User</button>` : '';
  return `
  <div class="role-note">${icon('alert')} Admins have full access. Staff can view products and update inventory but cannot delete records.</div>
  <div class="card" style="padding:0;">
  <div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>
  ${users.map(u=>`<tr><td class="cell-name">${u.name}</td><td class="cell-sub">${u.email}</td><td><span class="badge badge-role">${u.role}</span></td><td><div class="row-actions">${delBtn(`deleteUser(${u.id})`)}</div></td></tr>`).join('')}
  </tbody></table></div>
  </div>`;
}
function openUserModal(){
  document.getElementById('modal-root').innerHTML = `
  <div class="overlay show" onclick="if(event.target===this) closeModal()"><div class="modal">
    <div class="modal-head"><h3>Add User</h3><button class="close-x" onclick="closeModal()">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="user-form" onsubmit="submitUserForm(event)">
        <div class="field"><label>Full Name</label><input id="u-name" required placeholder="e.g. Jamie Cruz"></div>
        <div class="field"><label>Email</label><input id="u-email" type="email" required placeholder="jamie@ledger.io"></div>
        <div class="field"><label>Role</label><select id="u-role"><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
      </form>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="document.getElementById('user-form').requestSubmit()">${icon('check')} Add User</button></div>
  </div></div>`;
}
function submitUserForm(e){
  e.preventDefault();
  users.push({id:nextId.user++, name:document.getElementById('u-name').value.trim(), email:document.getElementById('u-email').value.trim(), role:document.getElementById('u-role').value});
  closeModal(); toast('User added', 'ok'); renderPage('users');
}
function deleteUser(id){
  confirmDialog('This will permanently remove the user from the workspace.', ()=>{
    users = users.filter(u=>u.id!==id); toast('User removed', 'ok'); renderPage('users');
  }, 'Remove this user?');
}

/* ======================= SETTINGS ======================= */
function renderSettings(actions){
  actions.innerHTML='';
  return `
  <div class="two-col">
    <div class="card">
      <div class="panel-title"><h3>Profile</h3></div>
      <div class="field"><label>Name</label><input value="${session.name}" disabled></div>
      <div class="field"><label>Email</label><input value="${session.name.toLowerCase().replace(' ','.')}@ledger.io" disabled></div>
      <div class="field"><label>Role</label><input value="${session.role}" disabled style="text-transform:capitalize;"></div>
      <div class="hint">Profile fields are managed by your workspace administrator.</div>
    </div>
    <div class="card">
      <div class="panel-title"><h3>Appearance</h3></div>
      <div class="field"><label>Theme</label><input value="Dark + Gold" disabled></div>
      <div class="hint">This workspace uses a fixed dark theme with gold accents.</div>
      <div class="divider"></div>
      <div class="panel-title"><h3>Notifications</h3></div>
      <label style="display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:10px;"><input type="checkbox" checked> Low stock alerts</label>
      <label style="display:flex;align-items:center;gap:10px;font-size:13px;"><input type="checkbox" checked> Weekly inventory summary email</label>
    </div>
  </div>`;
}

/* ======================= INIT ======================= */
function afterRender(page){
  if(page==='dashboard') setupDashboardCharts();
  if(page==='products') updateProductsTable();
  if(page==='transactions') updateTransactionsTable();
  if(page==='reports' && state.reportPreview) showReport(state.reportPreview);
  if(page==='stockout') updateStockOutHint();
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
renderSidebarLabels();
