import axios from "axios";
import * as dotenv from "dotenv";
import { MongoHeroDetail } from "./types";
import { getBehaviorName, getDispellableName, getEffectsName, getImmunityName } from "./utils";

async function main() {
    const listUrl = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2RhdGFmZWVkL2hlcm9MaXN0P3Rhc2s9aGVyb2xpc3Q=', 'base64').toString('utf-8');
    console.log("listUrl->", listUrl);

    try {
        const res = await axios.get(listUrl);
        const heroes = res.data.result.heroes;
        console.log("heroes->", heroes.length, heroes[0]);
        const detailUrl = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2RhdGFmZWVkL2hlcm8/aGVyb19pZD0=', 'base64').toString('utf-8');
        for (const h of heroes) {
            const res_d = await axios.get(detailUrl + h.id);
            const res_h = res_d.data.result.heroes;

            const result = {
                _id: res_h.id,
                name: res_h.name_loc,
                eng: res_h.name_english_loc,
                type: ['力量', '敏捷', '智力'][res_h.primary_attr],
                story: res_h.bio_loc,
                strengthStart: res_h.str_base,
                strengthGrow: res_h.str_gain.toFixed(1),
                agilityStart: res_h.agi_base,
                agilityGrow: res_h.agi_gain.toFixed(1),
                intelligenceStart: res_h.int_base,
                intelligenceGrow: res_h.int_gain.toFixed(1),
                attackType: res_h.attack_capability === 1 ? '近战' : "远程",
                attackPower: res_h.damage_min + "-" + res_h.damage_max,
                attackRate: res_h.attack_rate.toFixed(0),
                attackRange: res_h.attack_range,
                armor: res_h.armor.toFixed(1),
                magicResistance: res_h.magic_resistance + "%",
                speed: res_h.movement_speed,
                img: res_h.index_img,
                projectileSpeed: res_h.projectile_speed,
                turnRate: res_h.turn_rate.toFixed(2),
                sightDay: res_h.sight_range_day,
                sightNight: res_h.sight_range_night,
                health: res_h.max_health,
                healthRegen: res_h.health_regen.toFixed(2),
                mana: res_h.max_mana,
                manaRegen: res_h.mana_regen.toFixed(2),
                abilities: []
            }
            let num = 0;
            for (const a of res_h.abilities) {
                const ability = {
                    name: a.name_loc,
                    imageUrl: a.img,
                    description: a.desc_loc,
                    annotation: a.lore_loc,
                    magicConsumption: a.mana_costs.join('/'),
                    coolDown: a.cooldowns.join("/"),
                    tips: a.notes_loc.join("\n"),
                    shard: a.shard_loc,
                    scepter: a.scepter_loc,
                    behavior: getBehaviorName(a.behavior),
                    dispellable: getDispellableName(a.dispellable),
                    immunity: getImmunityName(a.immunity),
                    effect: getEffectsName(a.target_team + "," + a.target_type),
                    damage: ["", "物理", "魔法", "纯粹", "纯粹"][a.damage],
                    num
                }
                num++;
                result.abilities.push(ability);
            }

            console.log("hero up->", result);
            break;
        }


    } catch (e) {
        console.error("crawler heros error-->", e);
        process.exit(1);
    }
}


dotenv.config();
main();
