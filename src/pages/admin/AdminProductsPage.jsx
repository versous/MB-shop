import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatFCFA } from '../../lib/whatsapp';
import { storageService } from '../../lib/supabase';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductActive, showNotification, dataMode } = useStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Modale de confirmation de suppression
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // État du formulaire produit
  const defaultFormData = {
    name: '',
    category: 'Basic',
    price: 9000,
    description: '',
    images: [],
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#FFFFFF' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    is_active: true,
    stock_status: 'in_stock'
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [imageInput, setImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');

  // Ouvrir modale d'ajout
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setImageInput('');
    setModalOpen(true);
  };

  // Ouvrir modale de modification
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category || 'Basic',
      price: prod.price || 9000,
      description: prod.description || '',
      images: prod.images ? [...prod.images] : [],
      colors: prod.colors ? [...prod.colors] : [],
      sizes: prod.sizes ? [...prod.sizes] : ['S', 'M', 'L', 'XL'],
      is_active: prod.is_active ?? true,
      stock_status: prod.stock_status || 'in_stock'
    });
    setImageInput('');
    setModalOpen(true);
  };

  // Traitement d'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification('Le nom du produit est obligatoire.', 'error');
      return;
    }

    if (formData.images.length === 0) {
      showNotification('Veuillez ajouter au moins une photo pour le t-shirt.', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, editingProduct.updated_at);
      } else {
        await addProduct(formData);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Ajout d'image par URL
  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  // Upload d'image vers Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data, error } = await storageService.uploadProductImage(file);
      if (error) {
        showNotification("Erreur lors de l'upload de l'image.", 'error');
      } else if (data?.publicUrl) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.publicUrl]
        }));
        showNotification('Image uploadée avec succès !', 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification("Échec de l'upload.", 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Gestion des couleurs
  const handleAddColor = () => {
    if (newColorName.trim()) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }]
      }));
      setNewColorName('');
    }
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Gestion des tailles
  const allAvailableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
      };
    });
  };

  // Filtrage
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stockLabels = {
    in_stock: { label: 'En stock', className: 'bg-emerald-100 text-emerald-800' },
    low_stock: { label: 'Stock faible', className: 'bg-amber-100 text-amber-800' },
    out_of_stock: { label: 'Rupture', className: 'bg-red-100 text-red-800' }
  };

  if (dataMode === 'loading') {
    return <LoadingSpinner text="Synchronisation des produits..." />;
  }
  if (dataMode === 'error') {
    return <div role="alert" className="bg-red-50 border border-red-200 p-4 text-sm text-red-900">La liste des produits est indisponible ; aucune modification n’est autorisée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-200">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAFAFA] border border-neutral-300 py-2 px-3 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">Toutes catégories</option>
            <option value="Basic">Basic</option>
            <option value="Oversize">Oversize</option>
            <option value="Édition Spéciale">Édition spéciale</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-white uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Nom du t-shirt</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Prix</th>
                <th className="py-3.5 px-4">Tailles</th>
                <th className="py-3.5 px-4">Couleurs</th>
                <th className="py-3.5 px-4">Disponibilité</th>
                <th className="py-3.5 px-4">Visibilité</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'}
                      alt={p.name}
                      className="w-12 h-14 object-cover border border-neutral-200 bg-[#F5F5F5]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#111111] block text-sm">{p.name}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">ID: {p.id.substring(0, 8)}...</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-neutral-100 font-bold uppercase text-[10px] text-neutral-800 border border-neutral-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-[#111111] text-sm">
                    {formatFCFA(p.price)}
                  </td>
                  <td className="py-3 px-4 text-neutral-600 font-medium">
                    {p.sizes?.join(', ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {p.colors?.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        (stockLabels[p.stock_status] || stockLabels.in_stock).className
                      }`}
                    >
                      {(stockLabels[p.stock_status] || stockLabels.in_stock).label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        toggleProductActive(p.id).catch((err) => {
                          console.error('Erreur de mise à jour de la visibilité :', err);
                        });
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{p.is_active ? 'Actif' : 'Masqué'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-neutral-600 hover:text-[#111111] hover:bg-neutral-100 transition-colors"
                      title="Modifier le produit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setProductToDelete(p);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Supprimer le produit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE D'AJOUT / MODIFICATION PRODUIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-300 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-[#111111]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-[#111111] mb-6">
              {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau T-shirt'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Nom & Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Nom du t-shirt *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: T-Shirt Basic Noir Intense"
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      // Ajuster le prix suggéré
                      const suggestedPrice = newCat === 'Oversize'
                        ? 11000
                        : newCat === 'Basic'
                          ? 9000
                          : formData.price;
                      setFormData({ ...formData, category: newCat, price: suggestedPrice });
                    }}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="Basic">Basic (Prix suggéré: 9 000 FCFA)</option>
                    <option value="Oversize">Oversize (Prix suggéré: 11 000 FCFA)</option>
                    <option value="Édition Spéciale">Édition spéciale (prix à définir)</option>
                  </select>
                </div>
              </div>

              {/* Prix & Statut stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Prix de vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-bold"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Modifiable librement. Suggestions : Basic 9 000 FCFA / Oversize 11 000 FCFA
                  </span>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Disponibilité du stock *
                  </label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none font-medium"
                  >
                    <option value="in_stock">En stock à Abidjan</option>
                    <option value="low_stock">Stock faible</option>
                    <option value="out_of_stock">Rupture de stock</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Description détaillée
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Grammage du coton, détails de confection, coupe..."
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                />
              </div>

              {/* Gestion des photos (Storage ou URL) */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Photos du produit (Supabase Storage ou URL)
                </label>

                {/* Prévisualisation des photos */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-20 bg-[#F5F5F5] border border-neutral-300 group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Inputs pour ajouter une photo */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Coller l'URL d'une photo (Unsplash, CDN...)"
                    className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:border-[#111111] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold uppercase tracking-wider"
                  >
                    Ajouter URL
                  </button>

                  <label className="px-4 py-2 bg-[#111111] hover:bg-black text-white font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Upload...' : 'Fichier'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Tailles disponibles */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Tailles disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {allAvailableSizes.map((size) => {
                    const isSelected = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-10 h-8 flex items-center justify-center border font-bold uppercase transition-colors ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Couleurs disponibles */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Couleurs disponibles
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 text-xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-400"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-medium text-neutral-800">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="ml-1 text-neutral-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-neutral-300 bg-white cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Nom couleur (ex: Noir Ébène)"
                    className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold uppercase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Visibilité */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active_checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#111111]"
                />
                <label htmlFor="is_active_checkbox" className="font-semibold text-neutral-800 cursor-pointer">
                  Produit actif et visible sur la boutique publique
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 uppercase font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111111] hover:bg-black text-white uppercase font-bold tracking-wider shadow"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Supprimer ce t-shirt ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${productToDelete?.name}" ? Cette action effacera le produit du catalogue.`}
        confirmText="Supprimer définitivement"
        onConfirm={async () => {
          if (productToDelete) {
            try {
              await deleteProduct(productToDelete.id, productToDelete.updated_at);
              setDeleteConfirmOpen(false);
              setProductToDelete(null);
            } catch (err) {
              console.error('Erreur de suppression du produit :', err);
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
