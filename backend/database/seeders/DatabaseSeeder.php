<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Depot;
use App\Models\Item;
use App\Models\Requisition;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds BASTION with realistic data:
 *   1 admin, 1 demo officer + 4 more officers, 7 categories, 4 depots,
 *   24 equipment items, 28 requisitions across every workflow state.
 * Demo password for every account: Password123!
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------------------------------------------------------------- users
        $people = [
            ['Marcus Reyes',     'admin@bastion.test',   'Colonel',          'BLC-0001', 'Base Command HQ',     'admin'],
            ['Elena Navarro',    'officer@bastion.test', 'Captain',          'BLC-0102', 'Alpha Company',       'user'],
            ['Daniel Cruz',      'dcruz@bastion.test',   'First Lieutenant', 'BLC-0117', 'Bravo Company',       'user'],
            ['Rowan Mercado',    'rmercado@bastion.test','Staff Sergeant',   'BLC-0233', 'Signal Section',      'user'],
            ['Isabel Ramos',     'iramos@bastion.test',  'Second Lieutenant','BLC-0241', 'Medical Detachment',  'user'],
            ['Tomas Villanueva', 'tvillanueva@bastion.test','Sergeant',      'BLC-0310', 'Motor Pool',          'user'],
        ];

        $users = [];
        foreach ($people as [$name, $email, $rank, $sn, $unit, $role]) {
            $users[$email] = User::create([
                'name' => $name, 'email' => $email, 'rank' => $rank,
                'service_number' => $sn, 'unit' => $unit, 'role' => $role,
                'password' => 'Password123!', 'email_verified_at' => now(),
            ]);
        }
        $admin = $users['admin@bastion.test'];
        $officers = collect($users)->except('admin@bastion.test')->values();

        // ----------------------------------------------------------- categories
        $cats = [];
        foreach ([
            ['Communications',      'COM', 'radio',       'Radios, antennas, field phones and signal gear.'],
            ['Vehicles & Transport','VEH', 'truck',       'Utility trucks, trailers and recovery equipment.'],
            ['Medical',             'MED', 'heart-pulse', 'First aid, trauma kits and field medical supplies.'],
            ['Power & Utilities',   'PWR', 'zap',         'Generators, batteries, lighting and fuel handling.'],
            ['Field Gear',          'FLD', 'tent',        'Shelters, cots, tools and personal field equipment.'],
            ['Rations & Supply',    'LOG', 'package',     'Rations, water and consumable stores.'],
            ['Navigation & Optics', 'NAV', 'compass',     'GPS units, compasses, binoculars and night optics.'],
        ] as [$name, $code, $icon, $desc]) {
            $cats[$code] = Category::create(compact('name', 'code', 'icon') + ['description' => $desc]);
        }

        // --------------------------------------------------------------- depots
        $depots = [];
        foreach ([
            ['Alpha Supply Depot',   'ALP', 'Fort Mercer, Sector A — North Gate Warehouse 1'],
            ['Bravo Motor Pool',     'BRV', 'Fort Mercer, Sector B — Vehicle Yard 3'],
            ['Charlie Field Store',  'CHL', 'Camp Halcyon — Supply Tent Row C'],
            ['Delta Medical Annex',  'DLT', 'Fort Mercer, Sector D — Medical Building 2'],
        ] as [$name, $code, $loc]) {
            $depots[$code] = Depot::create(['name' => $name, 'code' => $code, 'location' => $loc]);
        }

        // ---------------------------------------------------------------- items
        // [name, serial, category, depot, qty, reorder, status, description]
        $itemRows = [
            ['VHF Tactical Radio, Handheld',     'COM-RT-2201', 'COM', 'ALP', 48,  10, 'operational',    'Encrypted handheld VHF radio with 12-hour battery.'],
            ['HF Base Station Transceiver',      'COM-HF-0410', 'COM', 'ALP',  6,   2, 'operational',    'Long-range base transceiver for command post use.'],
            ['Field Telephone Set EE-8',         'COM-FT-0877', 'COM', 'CHL', 22,   6, 'operational',    'Wired field telephone with 2 km cable reel.'],
            ['Antenna Mast Kit, 12 m',           'COM-AM-1190', 'COM', 'ALP',  4,   4, 'maintenance',    'Collapsible mast kit; guy-wire set under inspection.'],
            ['2.5-Ton Cargo Truck',              'VEH-TR-7301', 'VEH', 'BRV',  7,   2, 'operational',    'General cargo truck, 12-person bench capacity.'],
            ['Light Utility Vehicle 4x4',        'VEH-LU-5520', 'VEH', 'BRV', 11,   3, 'operational',    'Four-wheel-drive utility vehicle for patrol support.'],
            ['Water Trailer, 400 Gallon',        'VEH-WT-3318', 'VEH', 'BRV',  5,   2, 'operational',    'Towed potable water tank trailer.'],
            ['Recovery Winch Kit',               'VEH-RW-0924', 'VEH', 'BRV',  3,   3, 'maintenance',    'Heavy-duty recovery winch; cable replacement pending.'],
            ['Individual First Aid Kit',         'MED-FA-1001', 'MED', 'DLT',150,  40, 'operational',    'Compact kit with dressings, gloves and tourniquet.'],
            ['Combat Lifesaver Trauma Bag',      'MED-TB-2045', 'MED', 'DLT', 18,   6, 'operational',    'Aid bag stocked for squad-level trauma response.'],
            ['Field Stretcher, Folding',         'MED-ST-0650', 'MED', 'DLT', 14,   4, 'operational',    'Lightweight folding litter with carry straps.'],
            ['Portable Oxygen Concentrator',     'MED-OX-0331', 'MED', 'DLT',  4,   2, 'operational',    'Battery-powered oxygen unit for aid station.'],
            ['Diesel Generator, 10 kW',          'PWR-GN-1010', 'PWR', 'CHL',  9,   2, 'operational',    'Skid-mounted tactical quiet generator.'],
            ['Portable Floodlight Set',          'PWR-FL-4420', 'PWR', 'CHL', 16,   5, 'operational',    'Four-head LED floodlight on collapsible tripod.'],
            ['Deep-Cycle Battery Pack',          'PWR-BP-0782', 'PWR', 'ALP', 32,  10, 'operational',    '12V deep-cycle battery for radio and lighting kits.'],
            ['Fuel Jerrycan, 20 L',              'PWR-JC-9001', 'PWR', 'BRV', 60,  20, 'operational',    'Steel NATO-style fuel can with pour spout.'],
            ['General Purpose Tent, Medium',     'FLD-TN-3300', 'FLD', 'CHL', 26,   8, 'operational',    'Canvas tent sleeping 10 with floor and stove vent.'],
            ['Folding Field Cot',                'FLD-CT-1512', 'FLD', 'CHL', 95,  25, 'operational',    'Aluminium-frame folding cot, 120 kg rating.'],
            ['Entrenching Tool, Folding',        'FLD-ET-0286', 'FLD', 'ALP', 70,  20, 'operational',    'Folding shovel with carry pouch.'],
            ['Meal Ready-to-Eat, Case of 12',    'LOG-MR-6006', 'LOG', 'CHL', 210, 60, 'operational',    'Twelve-meal case; shelf life 36 months.'],
            ['Potable Water Container, 5 gal',   'LOG-WC-2218', 'LOG', 'ALP', 40,  15, 'operational',    'Food-grade collapsible water carrier.'],
            ['Handheld GPS Receiver',            'NAV-GP-8803', 'NAV', 'ALP', 30,   8, 'operational',    'Rugged GPS with map overlay and waypoint memory.'],
            ['Lensatic Compass',                 'NAV-LC-0145', 'NAV', 'ALP', 80,  20, 'operational',    'Luminous-dial compass with sighting wire.'],
            ['Night Vision Monocular',           'NAV-NV-3571', 'NAV', 'ALP',  8,   4, 'decommissioned', 'Generation-2 monocular retired from service.'],
        ];

        $items = [];
        foreach ($itemRows as $i => [$name, $serial, $cat, $depot, $qty, $reorder, $status, $desc]) {
            $items[] = Item::create([
                'name' => $name, 'serial_number' => $serial,
                'category_id' => $cats[$cat]->id, 'depot_id' => $depots[$depot]->id,
                'created_by' => $i % 3 === 0 ? $officers[$i % $officers->count()]->id : $admin->id,
                'quantity' => $qty, 'reorder_level' => $reorder,
                'status' => $status, 'description' => $desc,
            ]);
        }
        $operational = collect($items)->where('status', 'operational')->values();

        // --------------------------------------------------------- requisitions
        $purposes = [
            'Quarterly field exercise at Camp Halcyon',
            'Communications check for night convoy',
            'Replace worn equipment before inspection',
            'Support for medical readiness drill',
            'Forward operating site setup',
            'Disaster-relief standby deployment',
            'Training for new recruit intake',
            'Motor pool routine maintenance cycle',
            'Perimeter lighting upgrade at Sector B',
            'Resupply for 72-hour patrol rotation',
        ];
        $priorities = ['routine', 'routine', 'urgent', 'routine', 'critical', 'urgent'];
        // pending x8, approved x6, issued x6, returned x5, rejected x3 = 28
        $statuses = array_merge(
            array_fill(0, 8, 'pending'), array_fill(0, 6, 'approved'),
            array_fill(0, 6, 'issued'), array_fill(0, 5, 'returned'), array_fill(0, 3, 'rejected')
        );

        foreach ($statuses as $n => $status) {
            $created = now()->subDays(28 - $n)->subHours($n % 7);
            $reviewed = $status === 'pending' ? null : $created->copy()->addDay();

            // forceCreate so the back-dated created_at / updated_at values are kept
            Requisition::forceCreate([
                'reference' => sprintf('REQ-%s-%03d', $created->format('ymd'), $n + 1),
                'user_id' => $officers[$n % $officers->count()]->id,
                'item_id' => $operational[($n * 3) % $operational->count()]->id,
                'reviewed_by' => $reviewed ? $admin->id : null,
                'quantity' => 1 + ($n % 4),
                'purpose' => $purposes[$n % count($purposes)],
                'priority' => $priorities[$n % count($priorities)],
                'status' => $status,
                'needed_by' => now()->addDays(3 + ($n % 12))->toDateString(),
                'remarks' => $status === 'rejected' ? 'Rejected: request exceeds allocation for this quarter.' : null,
                'reviewed_at' => $reviewed,
                'created_at' => $created,
                'updated_at' => $reviewed ?? $created,
            ]);
        }
    }
}
