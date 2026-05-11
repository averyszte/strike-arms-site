import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBrands } from '@/hooks/useProducts';
import { hasActiveFilters } from '@/lib/category-filters';
import type { Category, ProductFilters } from '@/types/product';

// Subcategory options per category — mirrors the mega menu structure
const SUBCATEGORIES: Record<Category, { slug: string; label: string }[]> = {
  rifles: [
    { slug: 'aeg-rifles', label: 'AEG Rifles' },
    { slug: 'smgs', label: 'SMGs' },
    { slug: 'lmgs', label: 'Support Guns / LMGs' },
    { slug: 'dmr', label: 'DMR Rifles' },
    { slug: 'gbbr', label: 'Gas Rifles / GBBR' },
    { slug: 'sniper', label: 'Sniper Rifles' },
    { slug: 'shotguns', label: 'Shotguns' },
    { slug: 'spring-rifles', label: 'Spring Rifles' },
    { slug: 'rifle-magazines', label: 'Rifle Magazines' },
    { slug: 'rifle-accessories', label: 'Rifle Accessories' },
  ],
  pistols: [
    { slug: 'gbb-pistols', label: 'Gas Blowback Pistols' },
    { slug: 'electric-pistols', label: 'Electric Pistols' },
    { slug: 'spring-pistols', label: 'Spring Pistols' },
    { slug: 'revolvers', label: 'Revolvers' },
    { slug: 'machine-pistols', label: 'Machine Pistols' },
    { slug: 'pistol-magazines', label: 'Pistol Magazines' },
    { slug: 'pistol-parts', label: 'Pistol Parts' },
    { slug: 'holsters', label: 'Holsters' },
  ],
  consumables: [
    { slug: 'bbs', label: 'BBs' },
    { slug: 'bio-bbs', label: 'Bio BBs' },
    { slug: 'tracer-bbs', label: 'Tracer BBs' },
    { slug: 'speed-loaders', label: 'Speed Loaders' },
    { slug: 'grenades', label: 'Grenades' },
    { slug: 'green-gas', label: 'Green Gas' },
    { slug: 'co2', label: 'CO₂' },
    { slug: 'batteries', label: 'Batteries' },
    { slug: 'chargers', label: 'Chargers' },
    { slug: 'lubricants', label: 'Lubricants' },
    { slug: 'maintenance', label: 'Maintenance' },
  ],
  accessories: [
    { slug: 'optics', label: 'Optics' },
    { slug: 'scopes', label: 'Scopes' },
    { slug: 'flashlights', label: 'Flashlights' },
    { slug: 'lasers', label: 'Lasers' },
    { slug: 'tracers', label: 'Tracers' },
    { slug: 'suppressors', label: 'Suppressors' },
    { slug: 'grips', label: 'Grips' },
    { slug: 'muzzle-devices', label: 'Muzzle Devices' },
    { slug: 'mounts', label: 'Mounts' },
    { slug: 'rails', label: 'Rails & Attachments' },
    { slug: 'slings', label: 'Slings' },
    { slug: 'holsters', label: 'Holsters' },
    { slug: 'rifle-magazines', label: 'Magazines' },
  ],
  gear: [
    { slug: 'plate-carriers', label: 'Plate Carriers' },
    { slug: 'chest-rigs', label: 'Chest Rigs' },
    { slug: 'battle-belts', label: 'Battle Belts' },
    { slug: 'helmets', label: 'Helmets' },
    { slug: 'eye-protection', label: 'Eye Protection' },
    { slug: 'gloves', label: 'Gloves' },
    { slug: 'uniforms', label: 'Uniforms' },
    { slug: 'footwear', label: 'Footwear' },
    { slug: 'headwear', label: 'Headwear' },
    { slug: 'ghillie', label: 'Ghillie Suits' },
    { slug: 'pouches', label: 'Pouches' },
    { slug: 'gun-bags', label: 'Gun Bags' },
    { slug: 'patches', label: 'Patches' },
  ],
};

const MAX_PRICE_CENTS = 80000;

interface FilterSidebarContentProps {
  category: Category;
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

export function FilterSidebarContent({
  category,
  filters,
  onFilterChange,
}: FilterSidebarContentProps) {
  const { data: brands = [] } = useBrands(category);
  const subcategories = SUBCATEGORIES[category] ?? [];
  const isActive = hasActiveFilters(filters);

  const priceRange: [number, number] = [
    filters.minPrice ?? 0,
    filters.maxPrice ?? MAX_PRICE_CENTS,
  ];

  return (
    <div className="space-y-6">
      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() =>
            onFilterChange({
              subcategory: undefined,
              brand: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              inStockOnly: false,
              onSaleOnly: false,
            })
          }
        >
          Clear all filters
        </Button>
      )}

      {/* Sub-category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Type
        </p>
        <RadioGroup
          value={filters.subcategory ?? ''}
          onValueChange={(v) =>
            onFilterChange({ subcategory: v === '' ? undefined : v, page: 1 })
          }
          className="space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="" id="subcat-all" />
            <Label htmlFor="subcat-all" className="text-sm cursor-pointer font-normal">
              All
            </Label>
          </div>
          {subcategories.map((s) => (
            <div key={s.slug} className="flex items-center gap-2">
              <RadioGroupItem value={s.slug} id={`subcat-${s.slug}`} />
              <Label
                htmlFor={`subcat-${s.slug}`}
                className="text-sm cursor-pointer font-normal"
              >
                {s.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
            Brand
          </p>
          <div className="space-y-1.5">
            {brands.map((b) => (
              <div key={b.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${b.slug}`}
                  checked={filters.brand === b.slug}
                  onCheckedChange={(checked) =>
                    onFilterChange({ brand: checked ? b.slug : undefined, page: 1 })
                  }
                />
                <Label
                  htmlFor={`brand-${b.slug}`}
                  className="text-sm cursor-pointer font-normal flex-1"
                >
                  {b.name}
                </Label>
                <span className="text-xs text-muted-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price range */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Price
        </p>
        <Slider
          min={0}
          max={MAX_PRICE_CENTS}
          step={500}
          value={priceRange}
          onValueChange={([min, max]) =>
            onFilterChange({
              minPrice: min > 0 ? min : undefined,
              maxPrice: max < MAX_PRICE_CENTS ? max : undefined,
              page: 1,
            })
          }
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€{(priceRange[0] / 100).toFixed(0)}</span>
          <span>€{(priceRange[1] / 100).toFixed(0)}</span>
        </div>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="inStockOnly" className="text-sm cursor-pointer">
            In stock only
          </Label>
          <Switch
            id="inStockOnly"
            checked={!!filters.inStockOnly}
            onCheckedChange={(v) => onFilterChange({ inStockOnly: v, page: 1 })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="onSaleOnly" className="text-sm cursor-pointer">
            On sale only
          </Label>
          <Switch
            id="onSaleOnly"
            checked={!!filters.onSaleOnly}
            onCheckedChange={(v) => onFilterChange({ onSaleOnly: v, page: 1 })}
          />
        </div>
      </div>
    </div>
  );
}
