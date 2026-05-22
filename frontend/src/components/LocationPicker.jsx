import { useState, useEffect } from "react";

const NIGERIA_LOCATIONS = {
  "Abuja (FCT)": ["Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"],
  "Lagos": ["Lagos Island", "Lagos Mainland", "Ikeja", "Surulere", "Oshodi-Isolo", "Alimosho", "Kosofe", "Mushin", "Shomolu", "Apapa", "Ajeromi-Ifelodun", "Agege", "Ifako-Ijaiye", "Somolu", "Badagry", "Epe", "Ibeju-Lekki", "Ikorodu"],
  "Rivers": ["Port Harcourt", "Obio-Akpor", "Okrika", "Ogu-Bolo", "Eleme", "Tai", "Gokana", "Khana", "Oyigbo", "Opobo-Nkoro", "Andoni", "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", "Abua-Odual", "Ahoada East", "Ahoada West", "Ogba-Egbema-Ndoni", "Emohua", "Ikwerre", "Etche", "Omuma"],
  "Kano": ["Kano Municipal", "Fagge", "Dala", "Gwale", "Kumbotso", "Tarauni", "Nassarawa", "Ungogo", "Dawakin Kudu", "Tofa", "Rimin Gado", "Bagwai", "Gezawa", "Gabasawa", "Madobi", "Kura", "Bunkure", "Warawa", "Wudil", "Garko"],
  "Oyo": ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Akinyele", "Egbeda", "Ona Ara", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Oyo East", "Oyo West"],
  "Anambra": ["Awka North", "Awka South", "Onitsha North", "Onitsha South", "Nnewi North", "Nnewi South", "Aguata", "Anambra East", "Anambra West", "Idemili North", "Idemili South"],
  "Delta": ["Warri South", "Warri North", "Warri South-West", "Sapele", "Uvwie", "Ethiope East", "Ethiope West", "Oshimili North", "Oshimili South", "Asaba"],
  "Enugu": ["Enugu North", "Enugu South", "Igbo-Eze North", "Igbo-Eze South", "Udi", "Ezeagu", "Nkanu East", "Nkanu West"],
  "Kaduna": ["Kaduna North", "Kaduna South", "Chikun", "Igabi", "Zaria", "Sabon Gari", "Zangon Kataf"],
  "Imo": ["Owerri Municipal", "Owerri North", "Owerri West", "Ikeduru", "Mbaitoli", "Ngor Okpala"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ewekoro", "Ifo", "Sagamu", "Remo North"],
  "Borno": ["Maiduguri", "Jere", "Konduga", "Biu", "Hawul"],
  "Cross River": ["Calabar Municipal", "Calabar South", "Akamkpa", "Biase", "Abi"],
  "Edo": ["Oredo", "Ikpoba-Okha", "Egor", "Ovia North-East", "Ovia South-West", "Orhionmwon"],
  "Abia": ["Umuahia North", "Umuahia South", "Aba North", "Aba South", "Osisioma"],
  "Bayelsa": ["Yenagoa", "Ogbia", "Nembe", "Brass", "Southern Ijaw"],
  "Plateau": ["Jos North", "Jos South", "Jos East", "Barkin Ladi", "Bassa"],
  "Sokoto": ["Sokoto North", "Sokoto South", "Wamakko", "Dange-Shuni"],
  "Niger": ["Minna", "Bosso", "Chanchaga", "Paikoro", "Shiroro"],
  "Kwara": ["Ilorin East", "Ilorin South", "Ilorin West", "Asa", "Offa"],
  "Akwa Ibom": ["Uyo", "Ikot Ekpene", "Eket", "Oron", "Abak"],
  "Kogi": ["Lokoja", "Kogi", "Adavi", "Ajaokuta", "Ofu"],
  "Nasarawa": ["Lafia", "Akwanga", "Karu", "Keffi", "Nasarawa"],
  "Zamfara": ["Gusau", "Anka", "Bakura", "Birnin Magaji"],
  "Taraba": ["Jalingo", "Zing", "Lau", "Gashaka"],
  "Benue": ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"],
  "Adamawa": ["Yola North", "Yola South", "Jimeta", "Mubi North"],
  "Bauchi": ["Bauchi", "Tafawa Balewa", "Alkaleri", "Bogoro"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ivo"],
  "Ekiti": ["Ado-Ekiti", "Efon", "Ekiti East", "Ekiti West"],
  "Gombe": ["Gombe", "Akko", "Funakaye", "Dukku"],
  "Jigawa": ["Dutse", "Birnin Kudu", "Hadejia", "Gumel"],
  "Kebbi": ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"],
  "Katsina": ["Katsina", "Daura", "Funtua", "Kaita"],
  "Osun": ["Osogbo", "Ilesa East", "Ilesa West", "Ife North"],
  "Ondo": ["Akure North", "Akure South", "Ondo East", "Ondo West"],
  "Yobe": ["Damaturu", "Potiskum", "Nguru", "Fune"],
};

export default function LocationPicker({ value, onChange, label = "Location", required = false }) {
  const states = Object.keys(NIGERIA_LOCATIONS).sort();

  // Parse existing value
  const parseValue = (val) => {
    if (!val) return { state: "", lga: "" };
    const parts = val.split(", ");
    if (parts.length >= 2) return { state: parts[1], lga: parts[0] };
    return { state: val, lga: "" };
  };

  const parsed = parseValue(value);
  const [state, setState] = useState(parsed.state || "");
  const [lga, setLga] = useState(parsed.lga || "");

  const lgas = state ? NIGERIA_LOCATIONS[state] || [] : [];

  useEffect(() => {
    if (state && lga) {
      onChange(`${lga}, ${state}`);
    } else if (state) {
      onChange(state);
    }
  }, [state, lga]);

  const handleStateChange = (e) => {
    setState(e.target.value);
    setLga("");
  };

  return (
    <div className="location-picker">
      {label && <label className="location-label">{label} {required && <span style={{color:'var(--danger)'}}>*</span>}</label>}
      <div className="location-picker-row">
        <div className="form-group" style={{ margin: 0 }}>
          <select value={state} onChange={handleStateChange} required={required}>
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <select value={lga} onChange={e => setLga(e.target.value)} disabled={!state}>
            <option value="">Select LGA / Area</option>
            {lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      {state && lga && (
        <div className="location-preview">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {lga}, {state}
        </div>
      )}
    </div>
  );
}
