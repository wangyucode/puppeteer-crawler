import { convertImageUrl, getTalentString } from "./src/utils"

// console.log(Buffer.from('https://static.pwesports.cn', 'utf-8').toString('base64'))

console.log(convertImageUrl('https://img.dota2.com.cn/dota2static/dota2/6251c8c8-20fa-490a-a706-7c7b0da6662e.jpg'));

const t1 = {
    "id": 6299,
    "name": "special_bonus_magic_resistance_12",
    "name_loc": "+{s:value}% 魔法抗性",
    "desc_loc": "",
    "lore_loc": "",
    "notes_loc": [],
    "shard_loc": "",
    "scepter_loc": "",
    "type": 2,
    "behavior": "2",
    "target_team": 0,
    "target_type": 0,
    "flags": 0,
    "damage": 0,
    "immunity": 0,
    "dispellable": 0,
    "max_level": 4,
    "cast_ranges": [
        0
    ],
    "cast_points": [
        0,
        0,
        0,
        0
    ],
    "channel_times": [
        0,
        0,
        0,
        0
    ],
    "cooldowns": [
        0,
        0,
        0,
        0
    ],
    "durations": [
        0,
        0,
        0,
        0
    ],
    "damages": [
        0,
        0,
        0,
        0
    ],
    "mana_costs": [
        0,
        0,
        0,
        0
    ],
    "gold_costs": [],
    "special_values": [
        {
            "name": "value",
            "values_float": [
                12
            ],
            "is_percentage": false,
            "heading_loc": "",
            "bonuses": []
        }
    ],
    "is_item": false,
    "ability_has_scepter": false,
    "ability_has_shard": false,
    "ability_is_granted_by_scepter": false,
    "ability_is_granted_by_shard": false,
    "item_cost": 0,
    "item_initial_charges": 0,
    "item_neutral_tier": 4294967295,
    "item_stock_max": 0,
    "item_stock_time": 0,
    "item_quality": 0
}

console.log(getTalentString(t1));