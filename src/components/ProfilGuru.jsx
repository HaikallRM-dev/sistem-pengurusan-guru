import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  signOut, 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { useToast } from './Toast';

export default function ProfilGuru({ user }) {
  const toast = useToast();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk mod perisian
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  // State borang profil
  const [editData, setEditData] = useState({
    nama: '',
    noKp: '',
    gred: '',
    noTel: ''
  });
  const [saving, setSaving] = useState(false);

  // State borang kata laluan
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);

  // 1. Ambil data profil dari Firestore
  useEffect(() => {
    const fetchProfil = async () => {
      if (user) {
        try {
          const docRef = doc(db, "guru", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfil(data);
            setEditData({
              nama: data.nama || '',
              noKp: data.noKp || '',
              gred: data.gred || '',
              noTel: data.noTel || ''
            });
          }
        } catch (error) {
          console.error("Ralat mengambil profil:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfil();
  }, [user]);

  // 2. Fungsi simpan kemaskini profil
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, "guru", user.uid);
      await updateDoc(docRef, {
        nama: editData.nama,
        noKp: editData.noKp,
        gred: editData.gred,
        noTel: editData.noTel
      });

      setProfil({ ...profil, ...editData });
      setIsEditing(false);
      toast("Profil berjaya dikemaskini!");
    } catch (error) {
      console.error("Ralat kemaskini:", error);
      toast("Gagal kemaskini: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Fungsi tukar kata laluan dalam Firebase Auth
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passData.newPassword !== passData.confirmPassword) {
      toast("Kata laluan baharu dan pengesahan kata laluan tidak padan!");
      return;
    }

    if (passData.newPassword.length < 6) {
      toast("Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.");
      return;
    }

    setPassLoading(true);

    try {
      // Step A: Pengesahan semula kata laluan semasa untuk keselamatan (Re-authentication)
      const credential = EmailAuthProvider.credential(user.email, passData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Step B: Tukar kata laluan baharu
      await updatePassword(user, passData.newPassword);

      toast("Kata laluan berjaya ditukar!");
      setIsChangingPass(false);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error("Ralat tukar kata laluan:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast("Gagal: Kata laluan semasa anda tidak tepat.");
      } else {
        toast("Gagal menukar kata laluan: " + error.message);
      }
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="text-center p-4">Memuatkan profil...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Profil Peribadi Guru</h2>

      {/* --- MOD 1: BORANG EDIT PROFIL --- */}
      {isEditing ? (
        <form onSubmit={handleSaveProfil} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Penuh</label>
            <input
              type="text"
              required
              value={editData.nama}
              onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">No. Kad Pengenalan</label>
            <input
              type="text"
              required
              value={editData.noKp}
              onChange={(e) => setEditData({ ...editData, noKp: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Gred Jawatan</label>
            <input
              type="text"
              required
              value={editData.gred}
              onChange={(e) => setEditData({ ...editData, gred: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">No. Telefon</label>
            <input
              type="text"
              placeholder="cth. 0123456789"
              value={editData.noTel}
              onChange={(e) => setEditData({ ...editData, noTel: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition disabled:bg-slate-400"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition"
            >
              Batal
            </button>
          </div>
        </form>

      /* --- MOD 2: BORANG TUKAR KATA LALUAN --- */
      ) : isChangingPass ? (
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Tukar Kata Laluan</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Laluan Semasa</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Laluan Baharu</label>
            <input
              type="password"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minima 6 aksara"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pengesahan Kata Laluan Baharu</label>
            <input
              type="password"
              required
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ulang kata laluan baharu"
            />
          </div>
          <div className="flex gap-2 pt-3">
            <button
              type="submit"
              disabled={passLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:bg-slate-400"
            >
              {passLoading ? 'Menukar...' : 'Tukar Katalaluan'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsChangingPass(false);
                setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition"
            >
              Batal
            </button>
          </div>
        </form>

      /* --- MOD 3: PAPARAN PROFIL UTAMA --- */
      ) : (
        <div className="space-y-3 text-slate-700">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Nama Penuh</span>
            <span className="font-semibold text-lg">{profil?.nama}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">No. Kad Pengenalan</span>
            <span className="font-medium">{profil?.noKp}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Gred Jawatan</span>
            <span className="font-medium">{profil?.gred}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">No. Telefon</span>
            <span className="font-medium">{profil?.noTel || 'Belum diisi'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Email Pendidikan</span>
            <span className="font-medium">{profil?.email}</span>
          </div>

          <div className="pt-4 space-y-2">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
            >
              Kemaskini Profil
            </button>
            <button
              onClick={() => setIsChangingPass(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium transition"
            >
              Tukar Kata Laluan
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition"
            >
              Log Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}