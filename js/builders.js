// Every monument's builder, imported up front, for code that must build any monument at once and
// without waiting: the film in video/ renders each frame as a function of time alone. The site
// itself loads each builder only when its monument is opened (js/data.js), and never imports this.
// Keep in step with js/data.js.
import { buildQutub } from './monuments/qutub-minar.js';
import { buildGateway } from './monuments/gateway-of-india.js';
import { buildTaj } from './monuments/taj-mahal.js';
import { buildCharminar } from './monuments/charminar.js';
import { buildRamMandir } from './monuments/ram-mandir.js';
import { buildBrihadeeswara } from './monuments/brihadeeswara-temple.js';
import { buildIndiaGate } from './monuments/india-gate.js';
import { buildStatue } from './monuments/statue-of-unity.js';
import { buildHowrah } from './monuments/howrah-bridge.js';
import { buildJagannath } from './monuments/jagannath-puri-temple.js';
import { buildGoldenTemple } from './monuments/golden-temple.js';
import { buildHawaMahal } from './monuments/hawa-mahal.js';
import { buildKonark } from './monuments/konark-sun-temple.js';
import { buildMeenakshi } from './monuments/meenakshi-temple.js';
import { buildLotusTemple } from './monuments/lotus-temple.js';
import { buildGolGumbaz } from './monuments/gol-gumbaz.js';
import { buildMysorePalace } from './monuments/mysore-palace.js';
import { buildSanchi } from './monuments/sanchi-stupa.js';
import { buildMahabodhi } from './monuments/mahabodhi-temple.js';
import { buildRedFort } from './monuments/red-fort.js';
import { buildOldParliament } from './monuments/old-parliament-house.js';
import { buildRashtrapatiBhavan } from './monuments/rashtrapati-bhavan.js';
import { buildHumayun } from './monuments/humayuns-tomb.js';
import { buildJamaMasjid } from './monuments/jama-masjid.js';
import { buildNewParliament } from './monuments/new-parliament-house.js';
import { buildDilwara } from './monuments/dilwara-temples.js';
import { buildAkshardham } from './monuments/akshardham.js';
import { buildKandariya } from './monuments/kandariya-mahadeva.js';
import { buildRanakpur } from './monuments/ranakpur-jain-temple.js';
import { buildChennakesava } from './monuments/chennakesava-temple.js';
import { buildVictoriaMemorial } from './monuments/victoria-memorial.js';
import { buildCsmt } from './monuments/csmt.js';
import { buildKailasa } from './monuments/kailasa-temple.js';
import { buildVittala } from './monuments/vittala-temple-hampi.js';
import { buildPadmanabhaswamy } from './monuments/padmanabhaswamy-temple.js';
import { buildBomJesus } from './monuments/bom-jesus.js';
import { buildKamakhya } from './monuments/kamakhya-temple.js';
import { buildTawang } from './monuments/tawang-monastery.js';
import { buildAmberFort } from './monuments/amber-fort.js';
import { buildRaniKiVav } from './monuments/rani-ki-vav.js';
import { buildRamappa } from './monuments/ramappa-temple.js';
import { buildKedarnath } from './monuments/kedarnath-temple.js';
import { buildHazratbal } from './monuments/hazratbal-shrine.js';
import { buildShoreTemple } from './monuments/shore-temple.js';
import { buildGwaliorFort } from './monuments/gwalior-fort.js';
import { buildNalanda } from './monuments/nalanda-mahavihara.js';
import { buildTirumala } from './monuments/tirumala-temple.js';
import { buildCapitolComplex } from './monuments/capitol-complex.js';
import { buildHidimba } from './monuments/hidimba-devi-temple.js';
import { buildBandraWorli } from './monuments/bandra-worli-sea-link.js';
import { buildBulandDarwaza } from './monuments/buland-darwaza.js';
import { buildPanchMahal } from './monuments/panch-mahal.js';
import { buildBaraImambara } from './monuments/bara-imambara.js';
import { buildRumiDarwaza } from './monuments/rumi-darwaza.js';
import { buildChotaImambara } from './monuments/chota-imambara.js';
import { buildItmadUdDaulah } from './monuments/itmad-ud-daulah.js';
import { buildAkbarsTomb } from './monuments/akbars-tomb.js';
import { buildAgraFort } from './monuments/agra-fort.js';
import { buildBibiKaMaqbara } from './monuments/bibi-ka-maqbara.js';
import { buildSafdarjung } from './monuments/safdarjung-tomb.js';
import { buildSomnath } from './monuments/somnath-temple.js';
import { buildMallikarjuna } from './monuments/mallikarjuna-temple.js';
import { buildMahakaleshwar } from './monuments/mahakaleshwar-temple.js';
import { buildOmkareshwar } from './monuments/omkareshwar-temple.js';
import { buildBhimashankar } from './monuments/bhimashankar-temple.js';
import { buildKashiVishwanath } from './monuments/kashi-vishwanath-temple.js';
import { buildTrimbakeshwar } from './monuments/trimbakeshwar-temple.js';
import { buildBaidyanath } from './monuments/baidyanath-temple.js';
import { buildNageshwar } from './monuments/nageshwar-temple.js';
import { buildRamanathaswamy } from './monuments/ramanathaswamy-temple.js';
import { buildGrishneshwar } from './monuments/grishneshwar-temple.js';
import { buildDhamek } from './monuments/dhamek-stupa.js';
import { buildAjanta } from './monuments/ajanta-caves.js';
import { buildRumtek } from './monuments/rumtek-monastery.js';
import { buildThiksey } from './monuments/thiksey-monastery.js';
import { buildKeyMonastery } from './monuments/key-monastery.js';
import { buildGommateshwara } from './monuments/gommateshwara.js';
import { buildPalitana } from './monuments/palitana-temples.js';
import { buildShikharji } from './monuments/shikharji.js';
import { buildParshvanath } from './monuments/parshvanath-temple-khajuraho.js';
import { buildSonijiKiNasiyan } from './monuments/soniji-ki-nasiyan.js';
import { buildMehrangarh } from './monuments/mehrangarh-fort.js';
import { buildChittorgarh } from './monuments/chittorgarh-fort.js';
import { buildJaisalmer } from './monuments/jaisalmer-fort.js';
import { buildGolconda } from './monuments/golconda-fort.js';
import { buildDaulatabad } from './monuments/daulatabad-fort.js';
import { buildCityPalaceUdaipur } from './monuments/city-palace-udaipur.js';
import { buildLaxmiVilas } from './monuments/laxmi-vilas-palace.js';
import { buildFortAguada } from './monuments/fort-aguada.js';
import { buildBekal } from './monuments/bekal-fort.js';
import { buildCoochBehar } from './monuments/cooch-behar-palace.js';
import { buildSherShahSuri } from './monuments/sher-shah-suri-tomb.js';
import { buildCellularJail } from './monuments/cellular-jail.js';
import { buildShaheedMinar } from './monuments/shaheed-minar.js';
import { buildTipuGumbaz } from './monuments/tipu-sultan-gumbaz.js';
import { buildQutbShahiTombs } from './monuments/qutb-shahi-tombs.js';
import { buildVivekanandaRock } from './monuments/vivekananda-rock-memorial.js';
import { buildJallianwala } from './monuments/jallianwala-bagh.js';
import { buildKargilMemorial } from './monuments/kargil-war-memorial.js';
import { buildNationalWarMemorial } from './monuments/national-war-memorial.js';
import { buildKirtiMandir } from './monuments/kirti-mandir.js';

// Builders by the name js/data.js gives each monument (its `fn`).
export const BUILDERS = {
  buildQutub,
  buildGateway,
  buildTaj,
  buildCharminar,
  buildRamMandir,
  buildBrihadeeswara,
  buildIndiaGate,
  buildStatue,
  buildHowrah,
  buildJagannath,
  buildGoldenTemple,
  buildHawaMahal,
  buildKonark,
  buildMeenakshi,
  buildLotusTemple,
  buildGolGumbaz,
  buildMysorePalace,
  buildSanchi,
  buildMahabodhi,
  buildRedFort,
  buildOldParliament,
  buildRashtrapatiBhavan,
  buildHumayun,
  buildJamaMasjid,
  buildNewParliament,
  buildDilwara,
  buildAkshardham,
  buildKandariya,
  buildRanakpur,
  buildChennakesava,
  buildVictoriaMemorial,
  buildCsmt,
  buildKailasa,
  buildVittala,
  buildPadmanabhaswamy,
  buildBomJesus,
  buildKamakhya,
  buildTawang,
  buildAmberFort,
  buildRaniKiVav,
  buildRamappa,
  buildKedarnath,
  buildHazratbal,
  buildShoreTemple,
  buildGwaliorFort,
  buildNalanda,
  buildTirumala,
  buildCapitolComplex,
  buildHidimba,
  buildBandraWorli,
  buildBulandDarwaza,
  buildPanchMahal,
  buildBaraImambara,
  buildRumiDarwaza,
  buildChotaImambara,
  buildItmadUdDaulah,
  buildAkbarsTomb,
  buildAgraFort,
  buildBibiKaMaqbara,
  buildSafdarjung,
  buildSomnath,
  buildMallikarjuna,
  buildMahakaleshwar,
  buildOmkareshwar,
  buildBhimashankar,
  buildKashiVishwanath,
  buildTrimbakeshwar,
  buildBaidyanath,
  buildNageshwar,
  buildRamanathaswamy,
  buildGrishneshwar,
  buildDhamek,
  buildAjanta,
  buildRumtek,
  buildThiksey,
  buildKeyMonastery,
  buildGommateshwara,
  buildPalitana,
  buildShikharji,
  buildParshvanath,
  buildSonijiKiNasiyan,
  buildMehrangarh,
  buildChittorgarh,
  buildJaisalmer,
  buildGolconda,
  buildDaulatabad,
  buildCityPalaceUdaipur,
  buildLaxmiVilas,
  buildFortAguada,
  buildBekal,
  buildCoochBehar,
  buildSherShahSuri,
  buildCellularJail,
  buildShaheedMinar,
  buildTipuGumbaz,
  buildQutbShahiTombs,
  buildVivekanandaRock,
  buildJallianwala,
  buildKargilMemorial,
  buildNationalWarMemorial,
  buildKirtiMandir,
};
