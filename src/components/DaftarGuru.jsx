import { useState } from 'react';
import { auth, db } from '../firebase'; // Memanggil firebase.js anda
import { createUserWithEmailAndPassword } from '../firebase';
import { doc, setDoc } from '../firebase';
import { useToast } from './Toast';

export default function DaftarGuru() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    nama: '',
    noKp: '',
    gred: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Cipta akaun guru dalam Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Simpan profil guru ke dalam Firestore Database
      await setDoc(doc(db, "guru", user.uid), {
        uid: user.uid,
        nama: formData.nama,
        noKp: formData.noKp,
        gred: formData.gred,
        email: formData.email,
        peranan: 'guru',
        created_at: new Date()
      });

      toast.success("Pendaftaran Guru Berjaya!");
      setFormData({ nama: '', noKp: '', gred: '', email: '', password: '' });

    } catch (error) {
      console.error("Ralat pendaftaran:", error);
      toast.error("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Pendaftaran Guru Baharu</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penuh</label>
          <input type="text" name="nama" value={formData.nama} required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="cth. Cikgu Azman" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. Kad Pengenalan</label>
          <input type="text" name="noKp" value={formData.noKp} required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="cth. 880101015555" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gred Jawatan</label>
          <input type="text" name="gred" value={formData.gred} required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="cth. DG41" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Pendidikan</label>
          <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="g-12345@moe-dl.edu.my" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kata Laluan</label>
          <input type="password" name="password" value={formData.password} required onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="••••••••" />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition mt-2 disabled:bg-slate-400"
        >
          {loading ? 'Sedang Mendaftar...' : 'Daftar Guru'}
        </button>
      </form>
    </div>
  );
}