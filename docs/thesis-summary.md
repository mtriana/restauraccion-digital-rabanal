# Thesis summary

**Title (Spanish):** *Secuencia didáctica con monitoreo climático y tecnología móvil para la enseñanza de prácticas de restauración ecológica en el Páramo de Rabanal*

**English title:** A teaching sequence using climate monitoring and mobile technology for teaching ecological restoration practices in the Rabanal Páramo

**Author:** María Fernanda Triana Barrantes  
**Program:** Master of Education (Maestría en Educación), Faculty of Education, Universidad de Cundinamarca, Chía, Colombia, 2025  
**Advisor:** Carlos Humberto Olivella Zuleta  
**Teaching sequence name:** *RestaurAcción Digital — Technology at the service of the Rabanal Páramo*

## Problem

Páramos are high-Andean ecosystems that regulate the water supply of downstream communities and cities. In the Rabanal Páramo (Boyacá–Cundinamarca), restoration programs face two practical barriers:

- landholders have little access to timely information about the condition of their land;
- technical restoration guidance is rarely translated into actions that fit each family's resources and production.

## Approach

The work follows a quantitative approach grounded in Kolb's experiential learning, Siemens' connectivism and situated learning. It combines four technologies into one teaching sequence:

1. **Geospatial analysis (Google Earth Engine).** The ESA WorldCover 2021 land-cover layer was crossed with elevation above 3,000 m a.s.l. (the legal páramo threshold for the Eastern Cordillera) and with protected-area layers to locate degraded páramo areas in Vereda Montoya (Ventaquemada). Ten georeferenced points were selected to plan the visits.
2. **Portable weather station.** Micro:bit board and SparkFun sensors measure temperature, humidity, rainfall, wind speed and wind direction, programmed in Python and housed in an IP64 enclosure. Sensor heights follow WMO practice: 2 m for temperature and humidity, 5 m for wind and rain. Built in April 2024 and calibrated in September 2024.
3. **Mobile app (Flutter).** It presents the páramo's "vital signs" with traffic-light indicators, educational content and a land-use questionnaire.
4. **Artificial intelligence (GPT-4).** It generates a personalized restoration plan from the questionnaire answers, guided by a base plan written by a high-mountain restoration expert. Measured cost is about USD 0.01 per plan.

Plans and the final assessment reach participants through WhatsApp.

## Pilot

- **Site:** Vereda Montoya, Ventaquemada (Boyacá), Rabanal Páramo.
- **Participants:** 5 páramo inhabitants.
- **Field visits:** 3.
- **Session length:** about 3 hours, run with a facilitator guide (see `education/D-facilitator-guide.md`).
- **Instrument:** final Likert survey (1–5) covering clarity, relevance and usability (see `education/E-final-survey-instrument.md`).

## Results

| Dimension | Item | Favorable | Mean |
|---|---|---|---|
| Clarity | Instructions clear and easy to follow | 92% | 4.6 |
| Clarity | App information understandable | 92% | 4.6 |
| Clarity | Explanation of the páramo's importance | 96% | 4.8 |
| Relevance | WhatsApp chatbot answers clear and useful | 92% | 4.6 |
| Relevance | Native-species and restoration information useful | 84% | 4.2 |
| Relevance | AI plan fit the participant's reality | 92% | 4.6 |
| Usability | Sequence adapted to páramo conditions | 88% | 4.4 |
| Usability | Activities applicable in the community | 96% | 4.8 |
| Usability | Technology accessible and functional | 92% | 4.6 |
| Usability | Weather-station data understandable and useful | 100% | 5.0 |

**Improvement areas identified by participants:**

- more visual and audiovisual material;
- simpler wording for people with lower literacy;
- native-species content in the community's own vocabulary.

**Limitation:** with n = 5, results are an exploratory validation of the sequence and its tools.

## Contribution

The work shows a replicable, low-cost pattern for technology transfer to rural users:

- geospatial targeting decides where to act;
- low-cost field sensing shows what is happening;
- an expert-guided language model produces individual recommendations;
- everyday channels such as WhatsApp deliver them to people with limited connectivity and formal schooling.

## Availability

The full thesis document is deposited in the Universidad de Cundinamarca institutional repository.
