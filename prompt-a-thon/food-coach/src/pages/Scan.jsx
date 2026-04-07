import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { getNutriScoreColor, getHealthScore } from "../engine/scoringEngine";
import { Html5QrcodeScanner } from "html5-qrcode";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product/";

export default function Scan() {
  const { addScan, scanHistory } = useApp();
  const [mode, setMode] = useState("idle"); // idle | scanning | manual | result | loading | error
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  const startScanner = () => {
    setMode("scanning");
  };

  useEffect(() => {
    if (mode === "scanning" && scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      }, false);

      scanner.render(
        (decodedText) => {
          scanner.clear();
          fetchProduct(decodedText);
        },
        (err) => {}
      );
      scannerInstance.current = scanner;
    }
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(() => {});
        scannerInstance.current = null;
      }
    };
  }, [mode]);

  const fetchProduct = async (barcode) => {
    setMode("loading");
    try {
      const res = await fetch(`${OPEN_FOOD_FACTS_URL}${barcode}?fields=product_name,image_url,nutriments,nutriscore_grade,nova_group,allergens,categories,brands,ingredients_text,quantity`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = parseProduct(data.product, barcode);
        setProduct(p);
        addScan(p);
        setMode("result");
      } else {
        setErrorMsg("Product not found in Open Food Facts database.");
        setMode("error");
      }
    } catch (e) {
      setErrorMsg("Network error. Check your connection.");
      setMode("error");
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Try barcode if numeric, else show a demo product
    if (/^\d+$/.test(query.trim())) {
      fetchProduct(query.trim());
    } else {
      // Demo product for non-barcode search
      const demoProduct = getDemoProduct(query.trim());
      setProduct(demoProduct);
      addScan(demoProduct);
      setMode("result");
    }
  };

  const reset = () => {
    setMode("idle");
    setProduct(null);
    setQuery("");
    setErrorMsg("");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="greeting">📱 SCANNER</div>
        <h1>Scan & Discover</h1>
        <p className="subtitle">Check any food's health score instantly</p>
      </div>

      {mode === "idle" && (
        <>
          <div className="scan-area">
            <div style={{fontSize:'3rem', marginBottom:12}}>📷</div>
            <h3 style={{marginBottom:8}}>Barcode Scanner</h3>
            <p className="text-secondary text-sm" style={{marginBottom:20}}>Point your camera at any packaged food barcode to get instant nutrition insights</p>
            <button className="btn btn-primary btn-full" onClick={startScanner}>
              📷 Open Camera Scanner
            </button>
          </div>

          <div className="divider" style={{display:'flex', alignItems:'center', gap:12}}>
            <span className="text-muted text-xs">OR SEARCH BY BARCODE / NAME</span>
          </div>

          <form onSubmit={handleManualSearch} style={{display:'flex', gap:10, marginBottom:24}}>
            <input
              className="input"
              placeholder="Enter barcode or product name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{flex:1}}
            />
            <button type="submit" className="btn btn-primary" style={{padding:'12px 20px', flexShrink:0}}>
              🔍
            </button>
          </form>

          {/* Recent scans */}
          {scanHistory.length > 0 && (
            <>
              <div className="section-header">
                <h3 style={{fontSize:'0.9rem'}}>Recent Scans</h3>
              </div>
              {scanHistory.slice(0, 3).map((s, i) => (
                <div key={i} className="card" style={{marginBottom:10, display:'flex', alignItems:'center', gap:14, padding:'14px 16px'}}
                  onClick={() => { setProduct(s); setMode("result"); }}>
                  <div className={`nutri-badge nutri-${s.nutriScore || "C"}`}>{s.nutriScore || "C"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:'0.9rem'}}>{s.productName}</div>
                    <div className="text-xs text-muted">{new Date(s.scannedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="text-muted" style={{fontSize:'0.8rem'}}>→</span>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {mode === "scanning" && (
        <div>
          <div id="qr-reader" style={{borderRadius:'var(--radius-lg)', overflow:'hidden'}} />
          <button className="btn btn-ghost btn-full mt-4" onClick={reset}>Cancel</button>
        </div>
      )}

      {mode === "loading" && (
        <div className="card text-center" style={{padding:'48px 24px'}}>
          <div style={{fontSize:'2.5rem', marginBottom:12, animation:'spin 1s linear infinite', display:'inline-block'}}>⏳</div>
          <p className="text-secondary">Fetching nutrition data...</p>
        </div>
      )}

      {mode === "error" && (
        <div className="card text-center" style={{padding:'36px 24px', borderColor:'var(--accent-red)'}}>
          <div style={{fontSize:'2.5rem', marginBottom:12}}>❌</div>
          <p style={{color:'var(--accent-red)', marginBottom:16}}>{errorMsg}</p>
          <button className="btn btn-outline btn-full" onClick={reset}>Try Again</button>
        </div>
      )}

      {mode === "result" && product && (
        <ProductCard product={product} onReset={reset} />
      )}
    </div>
  );
}

function ProductCard({ product, onReset }) {
  const nsColor = getNutriScoreColor(product.nutriScore);
  const { calories, fat, saturatedFat, sugars, salt, protein, fiber } = product.nutrients || {};

  const getTrafficColor = (val, thresholds) => {
    if (val == null) return "#64748b";
    if (val <= thresholds[0]) return "#22c55e";
    if (val <= thresholds[1]) return "#eab308";
    return "#ef4444";
  };

  const getNOVALabel = (g) => {
    const labels = {1:"Unprocessed",2:"Processed Ingredients",3:"Processed",4:"Ultra-Processed"};
    const colors = {1:'badge-green',2:'badge-blue',3:'badge-yellow',4:'badge-red'};
    return { label: labels[g] || "Unknown", cls: colors[g] || 'badge-gray' };
  };

  const nova = getNOVALabel(product.novaGroup);

  return (
    <div style={{animation:'pageIn 0.3s ease'}}>
      {/* Image & Name */}
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.productName}
          style={{width:'100%', height:200, objectFit:'cover', borderRadius:'var(--radius-lg)', marginBottom:16}}
          onError={e => e.target.style.display = 'none'} />
      )}

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:16, marginBottom:16}}>
          <div style={{flex:1}}>
            <h2 style={{fontSize:'1.1rem', marginBottom:4}}>{product.productName}</h2>
            <p className="text-xs text-muted">{product.brand} · {product.quantity}</p>
          </div>
          {/* Nutri-Score */}
          <div style={{textAlign:'center'}}>
            <div style={{
              width:52, height:52, borderRadius:'var(--radius-sm)',
              background:nsColor, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.4rem', fontWeight:900, color:'#fff', flexShrink:0
            }}>{product.nutriScore || "?"}</div>
            <div className="text-xs text-muted mt-2">Nutri-Score</div>
          </div>
        </div>

        {/* NOVA Group */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <span className={`badge ${nova.cls}`}>NOVA {product.novaGroup} — {nova.label}</span>
        </div>

        {/* Traffic lights */}
        <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Per 100g/100ml</div>
        <div className="traffic-light">
          {[
            { label: "Fat", val: fat, unit:"g", thresholds:[3.5,17.5] },
            { label: "Sat. Fat", val: saturatedFat, unit:"g", thresholds:[1.5,5] },
            { label: "Sugars", val: sugars, unit:"g", thresholds:[5,22.5] },
            { label: "Salt", val: salt, unit:"g", thresholds:[0.3,1.5] },
          ].map(t => (
            <div key={t.label} className="tl-item">
              <div className="tl-dot" style={{background: getTrafficColor(t.val, t.thresholds)}} />
              <div className="tl-label">{t.label}</div>
              <div className="tl-val" style={{color: getTrafficColor(t.val, t.thresholds)}}>
                {t.val != null ? `${t.val}${t.unit}` : "N/A"}
              </div>
            </div>
          ))}
        </div>

        {/* Calories + key macros */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)', padding:12}}>
          {[
            {label:"Calories", val: calories != null ? `${calories}kcal` : "N/A"},
            {label:"Protein", val: protein != null ? `${protein}g` : "N/A"},
            {label:"Carbs", val: `${product.nutrients?.carbs ?? "N/A"}g`},
            {label:"Fiber", val: fiber != null ? `${fiber}g` : "N/A"},
          ].map(m => (
            <div key={m.label} style={{textAlign:'center'}}>
              <div style={{fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)'}}>{m.val}</div>
              <div className="text-xs text-muted">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Allergens */}
        {product.allergens && (
          <div style={{marginTop:14, padding:'10px 12px', background:'rgba(239,68,68,0.08)', borderRadius:'var(--radius-sm)', borderLeft:'3px solid var(--accent-red)'}}>
            <span style={{fontSize:'0.75rem', color:'#f87171', fontWeight:600}}>⚠️ Contains: {product.allergens}</span>
          </div>
        )}

        {/* Health tip */}
        <div style={{marginTop:12, padding:'10px 12px', background:'rgba(34,197,94,0.08)', borderRadius:'var(--radius-sm)', borderLeft:'3px solid var(--accent)'}}>
          <span className="text-sm text-secondary">💡 {getHealthTip(product)}</span>
        </div>
      </div>

      <button className="btn btn-ghost btn-full" onClick={onReset}>← Scan Another</button>
    </div>
  );
}

function parseProduct(p, barcode) {
  const n = p.nutriments || {};
  return {
    productName: p.product_name || "Unknown Product",
    brand: p.brands || "Unknown Brand",
    quantity: p.quantity || "",
    imageUrl: p.image_url || "",
    nutriScore: (p.nutriscore_grade || "c").toUpperCase(),
    novaGroup: p.nova_group || 3,
    allergens: p.allergens || "",
    barcode,
    nutrients: {
      calories: Math.round(n["energy-kcal_100g"] || n.energy_100g / 4.184 || 0),
      fat: n.fat_100g,
      saturatedFat: n["saturated-fat_100g"],
      sugars: n.sugars_100g,
      salt: n.salt_100g,
      protein: n.protein_100g,
      fiber: n.fiber_100g,
      carbs: n.carbohydrates_100g,
    },
  };
}

function getDemoProduct(name) {
  return {
    productName: name || "Demo Biscuits",
    brand: "Demo Brand",
    quantity: "100g",
    imageUrl: "",
    nutriScore: "D",
    novaGroup: 4,
    allergens: "Gluten, Milk",
    barcode: "demo",
    nutrients: { calories: 480, fat: 22, saturatedFat: 9, sugars: 28, salt: 0.8, protein: 6, fiber: 2, carbs: 65 },
    scannedAt: Date.now(),
  };
}

function getHealthTip(product) {
  const ns = product.nutriScore;
  if (ns === "A" || ns === "B") return "Great choice! This product has a solid nutritional profile.";
  if (ns === "C") return "Moderate choice — enjoy in reasonable portions.";
  if (ns === "D") return "Consider checking the sugar or fat content. Look for a similar product with a better Nutri-Score.";
  if (ns === "E") return "This is a low nutritional quality product. Try to limit consumption or find a healthier alternative.";
  if (product.novaGroup === 4) return "Ultra-processed (NOVA 4) — minimal whole-food ingredients. Consider less processed alternatives.";
  return "Check the traffic light labels to guide your choice.";
}
