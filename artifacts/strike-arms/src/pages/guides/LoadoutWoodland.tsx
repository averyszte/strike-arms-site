import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'Chest rig, plate carrier or battle belt for woodland airsoft?',
    answer:
      'A chest rig is the best general starting point — light, ventilated, and it carries the essentials. A battle belt suits a very light load. A plate carrier is only worth it when you specifically want its fit, protection or load distribution; otherwise it adds heat, bulk and weight without carrying what you actually need.',
  },
  {
    question: 'How should I layer for a full day in Irish woodland?',
    answer:
      'A moisture-wicking base layer, a light insulating mid-layer when needed, and a breathable waterproof outer you can vent or remove. Avoid heavy cotton next to the skin because it stays wet and cold. Carry one compact dry or warm layer rather than wearing everything from the start.',
  },
  {
    question: 'How many magazines for a woodland game?',
    answer:
      'Around three to six mid-caps depending on capacity, game length and reload availability. Woodland games run longer between resupply than CQB, so carry a little more ammo and water — but only what that game actually needs.',
  },
  {
    question: 'How do I carry a full day of gear without getting exhausted?',
    answer:
      'Carry only the water, ammo and gear that game needs, keep the weight close to the body, and strip out duplicate tools, oversized pouches and unnecessary armour. Fatigue by lunchtime is nearly always a load problem, not a fitness one.',
  },
  {
    question: 'What is the difference between a CQB and a woodland loadout?',
    answer:
      'Beyond camouflage: woodland carries more ammunition, water and layers and benefits from a supportive two-point sling. CQB favours a shorter gun, a low-profile rig, fewer bulky pouches, secure retention and a sling that keeps the gun close.',
  },
];

export default function LoadoutWoodland() {
  return (
    <ArticleLayout
      title="Woodland Airsoft Loadout: Kit for a Full Day Outdoors"
      metaTitle="Woodland Airsoft Loadout Guide | Strike Arms Ireland"
      description="Building a woodland airsoft loadout for Irish conditions: rig choice, layering for wet weather, magazine count and placement, slings, hydration and carrying a day's kit without fatigue."
      path="/guides/loadout-woodland"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="A woodland day asks different questions than a CQB session. You are out for longer, you carry more, and Irish weather will find whatever you got wrong. The goal is a loadout you can still move in at four in the afternoon."
      cta={{ label: 'Browse tactical gear', href: '/store/gear' }}
      faq={FAQ}
    >
      <h2>What changes outdoors</h2>
      <p>
        Beyond camouflage, a woodland{' '}
        <Link href="/glossary#loadout">loadout</Link> carries more ammunition, water and layers than
        a CQB one, and benefits from a supportive two-point sling. Distances are longer, games run
        longer between resupply, and you will spend real time kneeling, crawling and standing about
        in the damp.
      </p>

      <h2>Rig choice</h2>
      <p>
        A <Link href="/store/gear/chest-rigs">chest rig</Link> is the best general starting point:
        light, ventilated, and it carries the essentials without cooking you. A{' '}
        <Link href="/store/gear/battle-belts">battle belt</Link> suits a very light load.
      </p>
      <p>
        A <Link href="/store/gear/plate-carriers">plate carrier</Link> is only the right answer when
        you specifically want its fit, protection or load distribution. It becomes the wrong choice
        the moment it is adding heat, bulk and weight without carrying what you actually need —
        which, on a warm day in thick cover, is most of the time.
      </p>

      <h2>Layering for Irish weather</h2>
      <p>The system that works across a full day:</p>
      <ul>
        <li>A <strong>moisture-wicking base layer</strong> next to the skin.</li>
        <li>A <strong>light insulating mid-layer</strong> when you need it.</li>
        <li>
          A <strong>breathable waterproof outer</strong> you can vent or take off.
        </li>
      </ul>
      <p>
        Avoid heavy cotton against the skin — it soaks, stays wet and turns cold the moment you stop
        moving. Carry one compact dry or warm layer rather than wearing everything from the start;
        you will overheat in the first hour and have nothing left for the last one. Check what{' '}
        <Link href="/store/gear/uniforms">clothing</Link> your site expects, if anything.
      </p>

      <h2>Footwear</h2>
      <p>
        Irish woodland is wet, uneven and frequently boggy, so{' '}
        <Link href="/store/gear/footwear">boots</Link> with real grip and genuine ankle support are
        not optional — they are on the essential kit list alongside eye protection. Comfortable and
        broken-in beats new and tactical-looking every time.
      </p>

      <h2>Magazines and placement</h2>
      <p>
        Around <strong>three to six mid-caps</strong>, depending on capacity, game length and how
        often you can reload. Mid-caps are quieter and more consistent; hi-caps carry more but rattle
        and need winding, which matters when you are trying to hold still in cover.
      </p>
      <p>
        Put primary <Link href="/store/rifles/rifle-magazines">magazines</Link> on your{' '}
        <strong>support-hand side</strong> within natural reach, mirrored if you are left-handed, and
        keep the front of the rig clear enough to crouch and go prone comfortably. You will be doing
        both a lot more than you do indoors.
      </p>
      <p>
        A <Link href="/store/gear/pouches">dump pouch</Link> goes where your support hand reaches
        without looking, usually behind the hip on that side — structured enough to find by feel,
        closed while you move so magazines do not bounce out.
      </p>

      <h2>Slings</h2>
      <p>
        A <Link href="/store/accessories/slings">two-point adjustable sling</Link> is the best
        all-round choice and especially suits woodland: it supports the gun over long carries and
        tightens to the body when you need both hands for a fence, a ditch or a climb. A single-point
        feels quick but swings freely, which gets old fast over rough ground.
      </p>

      <h2>Hydration and carrying weight</h2>
      <p>
        A bottle or a bladder — whichever you will actually clean and drink from. The best hydration
        system is the one you use.
      </p>
      <p>
        Beyond that, carry only the water, ammunition and gear <em>that game</em> needs, keep the
        weight close to the body, and strip out duplicate tools, oversized pouches and unnecessary
        armour. Being wrecked by lunchtime is usually a loadout problem rather than a fitness one.
      </p>

      <h2>The first €150 of gear</h2>
      <p>In priority order, before anything tactical:</p>
      <ol>
        <li>Rated full-seal <Link href="/store/gear/eye-protection">eye protection</Link>.</li>
        <li>Lower-face or dental protection.</li>
        <li>Supportive boots with grip.</li>
        <li><Link href="/store/gear/gloves">Gloves</Link>.</li>
        <li>Anti-fog and hydration.</li>
        <li>A simple way to carry magazines — a basic chest rig or belt and one or two spares.</li>
      </ol>
      <p>
        All of that beats a helmet, radio, sidearm or heavy plate carrier at the start. Plate
        carriers, helmets, radios, sidearms, optics and excessive pouches are where beginners most
        often over-buy.
      </p>

      <h2>Small things experienced players carry</h2>
      <p>
        Anti-fog, a spare charged{' '}
        <Link href="/store/consumables/batteries">battery</Link>, a speedloader, a barrel-cleaning
        rod, water, a microfibre cloth, electrical tape, a small basic{' '}
        <Link href="/store/more/tools">tool</Link> and a secure dump pouch. Very little weight, and
        between them they cover most of what goes wrong on a game day.
      </p>
      <p>
        A wet day also means looking after the gun afterwards — see the{' '}
        <Link href="/guides/airsoft-maintenance">maintenance guide</Link> for what to do before it
        goes back in the bag.
      </p>

      <h2>Buying a rig online: fit</h2>
      <p>
        Measure your chest and waist <em>where the rig will sit</em>, check the maker's adjustment
        range, and allow for the layers you will wear underneath — easy to forget when you are
        ordering in summer for a winter game. For a plate carrier, check torso length so it does not
        sit on your stomach or clash with your belt. Sizing from clothing labels instead of the
        product's actual measurements is the usual mistake.
      </p>
      <p>
        Playing indoors as well? The <Link href="/guides/loadout-cqb">CQB loadout guide</Link> covers
        what to strip back for close quarters.
      </p>
    </ArticleLayout>
  );
}
