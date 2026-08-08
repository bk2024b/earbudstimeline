import FormField from './FormField';

export default function EarbudForm({ action, brands, defaults = {}, lockId = false, submitLabel = 'Enregistrer' }) {
  return (
    <form action={action} encType="multipart/form-data" className="max-w-xl flex flex-col gap-4">
      {!lockId ? (
        <FormField
          label="Identifiant (slug)"
          name="id"
          placeholder="ex. airpods-pro-3"
          hint="Utilisé dans l'URL /ecouteurs/... Laisser vide pour le générer automatiquement. Non modifiable ensuite."
        />
      ) : (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Identifiant (slug)</span>
          <input
            value={defaults.id}
            disabled
            className="bg-panel border border-line rounded-lg px-3 py-2.5 text-dim"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Marque</span>
          <select
            name="brand_id"
            defaultValue={defaults.brand_id || ''}
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent"
          >
            <option value="" disabled>
              Choisir...
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Gamme"
          name="gamme"
          placeholder="ex. AirPods Pro"
          defaultValue={defaults.gamme}
          hint="Les modèles d'une même gamme sont comparés entre eux (« ADN de la gamme »)."
          required
        />
      </div>

      <FormField label="Nom" name="name" placeholder="ex. AirPods Pro 3" defaultValue={defaults.name} required />

      <div>
        <label className="block text-xs text-dim mb-1.5">Photo (optionnel)</label>
        {defaults.image_url && (
          <div className="mb-2.5 w-24 h-24 rounded-lg bg-panel2 border border-line flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={defaults.image_url} alt="" className="w-full h-full object-contain" />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
        />
        <p className="text-xs text-dim mt-1.5">
          {defaults.image_url
            ? 'Laisser vide pour conserver la photo actuelle.'
            : "Sans photo, l'icône générique de la marque est utilisée à la place."}
        </p>
      </div>
      <FormField
        label="Accroche"
        name="tagline"
        placeholder="Une phrase courte"
        defaultValue={defaults.tagline}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date de sortie"
          name="release_date"
          type="date"
          defaultValue={defaults.release_date}
          required
        />
        <FormField
          label="Prix au lancement ($)"
          name="price"
          type="number"
          step="1"
          defaultValue={defaults.price ?? ''}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Autonomie écouteur (h)"
          name="battery_bud_h"
          type="number"
          step="0.1"
          defaultValue={defaults.battery_bud_h}
          required
        />
        <FormField
          label="Autonomie totale (h)"
          name="battery_case_h"
          type="number"
          step="0.1"
          defaultValue={defaults.battery_case_h}
          required
        />
        <FormField
          label="Poids / écouteur (g)"
          name="weight_g"
          type="number"
          step="0.01"
          defaultValue={defaults.weight_g}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Certification eau"
          name="water_rating"
          placeholder="ex. IPX4"
          defaultValue={defaults.water_rating}
          required
        />
        <FormField label="Puce" name="chip" placeholder="ex. Apple H2" defaultValue={defaults.chip} />
        <FormField label="Bluetooth" name="bluetooth" placeholder="ex. 5.3" defaultValue={defaults.bluetooth} required />
        <FormField
          label="Codecs"
          name="codec"
          placeholder="ex. AAC, SBC, LDAC"
          defaultValue={defaults.codec}
          hint="Séparés par une virgule."
        />
      </div>

      <div className="flex gap-6 py-1 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="anc" defaultChecked={defaults.anc} className="accent-accent" />
          Réduction de bruit active
        </label>
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="usb_c" defaultChecked={defaults.usb_c} className="accent-accent" />
          USB-C
        </label>
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="multipoint" defaultChecked={defaults.multipoint} className="accent-accent" />
          Multipoint
        </label>
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="marquant" defaultChecked={defaults.marquant} className="accent-accent" />
          Modèle marquant
        </label>
      </div>

      <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2 self-start">
        {submitLabel}
      </button>
    </form>
  );
}
