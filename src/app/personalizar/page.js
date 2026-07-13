"use client";
import { useState } from 'react';

export default function Personalizar() {
  const [formData, setFormData] = useState({
    instrumento: '',
    topologia: '',
    potencia: '',
    loop: false,
    efeitos: '',
    formato: '',
    falantes: '',
    timbre: ''
  });

  const handleCheckbox = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarParaWhatsApp = () => {
    const mensagem = `*Novo Projeto Tupã Áudio*%0A%0A` +
      `*Instrumento:* ${formData.instrumento}%0A` +
      `*Topologia:* ${formData.topologia}%0A` +
      `*Potência:* ${formData.potencia}%0A` +
      `*Loop de Efeitos:* ${formData.loop ? 'Sim' : 'Não'}%0A` +
      `*Efeitos:* ${formData.efeitos}%0A` +
      `*Formato:* ${formData.formato}%0A` +
      `*Falantes:* ${formData.falantes}%0A` +
      `*Timbre Esperado:* ${formData.timbre}`;

    // Substitua pelo seu número pessoal (formato internacional, sem +, sem 0)
    const numeroWhatsApp = "5527999441078"; 
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-tupaBlack text-tupaOffWhite p-10">
      <div className="max-w-2xl mx-auto border border-tupaWood p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-serif text-tupaGold mb-6 text-center">Personalize o seu</h1>
        
        <div className="space-y-6">
          <select name="instrumento" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood">
            <option value="">Guitarra ou Baixo?</option>
            <option value="Guitarra">Guitarra</option>
            <option value="Baixo">Baixo</option>
          </select>

          <select name="topologia" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood">
            <option value="">Topologia (Valvulado/Transistorizado/Híbrido)</option>
            <option value="Valvulado">Valvulado</option>
            <option value="Transistorizado">Transistorizado</option>
            <option value="Híbrido">Híbrido</option>
          </select>

          <input type="text" name="potencia" placeholder="Potência aproximada (W)" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood"/>

          <label className="flex items-center gap-3">
            <input type="checkbox" name="loop" onChange={handleCheckbox} className="accent-tupaGold" /> Incluir loop de efeitos
          </label>

          <input type="text" name="efeitos" placeholder="Incluir efeitos simples (Overdrive, Reverb, Chorus...)" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood"/>
          
          <select name="formato" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood">
            <option value="">Cabeçote ou Combo?</option>
            <option value="Cabeçote">Cabeçote</option>
            <option value="Combo">Combo</option>
          </select>

          <input type="text" name="falantes" placeholder="Quantidade, tamanho e modelo dos falantes (ou peça sugestão)" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood"/>

          <textarea name="timbre" placeholder="Como você espera que seja o timbre?" onChange={handleChange} className="w-full bg-tupaGrey p-3 rounded border border-tupaWood h-32"></textarea>

          <div className="text-xs text-tupaSilver italic">
            *Nossa oficina responde em até 48h. Pedidos feitos a partir de quinta-feira serão respondidos na segunda até as 18h.*
          </div>

          <button onClick={enviarParaWhatsApp} className="w-full bg-tupaGold text-tupaBlack py-4 rounded font-bold hover:bg-white transition-all">
            Enviar Projeto via WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}