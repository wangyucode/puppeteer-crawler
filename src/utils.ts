export function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const staticUrl = Buffer.from('aHR0cHM6Ly9pbWcuZG90YTIuY29tLmNu', "base64").toString('utf-8');
// console.log(staticUrl);

export function convertImageUrl(url: string): string {
    return url.startsWith(staticUrl) ? 'https://wycode.cn' + url.substring(24) : url;
}

export function getBehaviorName(e) {
    var t = "";
    switch (e) {
        case 65536:
        case 65538:
            t = "光环";
            break;
        case 4096:
            t = "自动施放";
            break;
        case 4:
        case 8589934597:
        case 8724152325:
        case 8589936645:
        case 8590459013:
        case 8590458885:
        case 8724152389:
        case 8594131013:
        case 8623489245:
        case 8594130949:
            t = "无目标";
            break;
        case 2:
        case 8589934595:
            t = "被动";
            break;
        case 16:
        case 8589934641:
        case 8589934640:
        case 67108880:
        case 134217776:
        case 8589934609:
        case 8724152369:
        case 8594131025:
        case 8724152401:
        case 8724152433:
        case 8589934801:
        case 8589934769:
        case 9663676433:
            t = "点目标";
            break;
        case 32:
            t = "点范围";
            break;
        case 512:
            t = "开关";
            break;
        case 8:
        case 8589934601:
        case 134217736:
        case 8589934617:
        case 8589934665:
        case 8590069769:
        case 8623489033:
        case 8757706825:
        case 8724152393:
            t = "单位目标";
            break;
        default:
            t = e % 65536 == 0 ? "光环" : e % 4096 == 0 ? "自动施放" : e % 512 == 0 ? "开关" : e % 32 == 0 ? "点范围" : e % 16 == 0 ? "点目标" : e % 8 == 0 ? "单位目标" : e % 4 == 0 ? "无目标" : e % 2 == 0 ? "被动" : "";
            break
    }
    return t
}

export function getEffectsName(t) {
    var a = "";
    switch (t) {
        case "3,19":
        case "3,3":
        case "3,1":
            a = "英雄";
            break;
        case "3,128":
            a = "单位";
            break;
        case "1,19":
        case "1,3":
            a = "友方单位";
            break;
        case "1,1":
            a = "友方英雄";
            break;
        case "2,3":
        case "2,19":
            a = "敌方单位";
            break;
        case "2,23":
            a = "敌方单位和建筑";
            break;
        case "1,23":
            a = "友方单位和建筑";
            break;
        case "2,0":
        case "2,64":
            a = "敌方";
            break;
        case "1,0":
            a = "队友";
            break;
        case "2,1":
            a = "敌方英雄";
            break;
        case "1,6":
            a = "友方普通单位";
            break;
        case "2,6":
            a = "敌方普通单位";
            break;
        default:
            break
    }
    return a
}

export function getImmunityName(e) {
    var t = "";
    switch (e) {
        case 1:
        case 3:
            t = "是";
            break;
        case 2:
        case 4:
            t = "否";
            break;
        case 5:
            t = "对友无视，对敌无效";
            break;
        default:
            break
    }
    return t
}

export function getDispellableName(e) {
    var t = "";
    switch (e) {
        case 3:
            t = "否";
            break;
        case 2:
            t = "是";
            break;
        case 1:
            t = "仅强驱散";
            break;
        default:
            break
    }
    return t
}

export function replaceValue(s: string, values: any[]): string {
    let result = s;
    const matches = s.match(/%[^%]*%/g);
    if (matches && matches.length) {
        for (const match of matches) {
            let value = "%";
            if (match.length > 2) {
                value = getValue(values.find(v => v.name.toLowerCase() === match.substring(1, match.length - 1).toLowerCase()))
            }
            if (value) {
                result = result.replace(match, value);
            }
        }
    }
    return result
}

export function getValue(object: any): string {
    let value = ""
    if (!object) {
        return null;
    } else if (object.values_int.length) {
        value = joinSlash(object.values_int.map(i => i + (object.is_percentage ? '%' : '')));
    } else if (object.values_float.length) {
        value = joinSlash(object.values_float.map(i => getSuitableFloat(i)).map(i => i + (object.is_percentage ? '%' : '')));
    }

    return value
}

export function getSuitableFloat(f: number, i: number = 2): string {
    let result = f.toFixed(i);
    if (/\./.test(result)) {
        if (result.charAt(result.length - 1) === '0') {
            result = getSuitableFloat(f, --i);
        }
    }
    return result;
}

export function joinSlash(a: any[]): string {
    let last = a[0];
    let hasDiff = false;
    for (const v of a) {
        if (last !== v) {
            hasDiff = true;
            break;
        }
    }
    return hasDiff ? a.join('/') : a[0] + ''
}

export function getTalentString(t: any): string {
    let result = t.name_loc;
    const matches = result.match(/{s:(.*)}/);
    if (matches && matches.length > 1) {
        const v = getValue(t.special_values[0]);
        result = result.replace(matches[0], v);
    }
    return result;
}

export function removeHtmlTag(s: string): string {
    s = s.replace(/\n$/, "");
    s = s.replace(/[：:]$/, "");
    return s.replace(/<\s*(\S+)(\s[^>]*)?>/g, "");
}

export function clearStory(s: string): string {
    s = s.replace(/<\s*(\S+)(\s[^>]*)?>/g, "");
    s = s.replace(/[\r\n\t]+/g, "\n");
    return s;
}