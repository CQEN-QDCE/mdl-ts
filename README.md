[![img](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://www.quebec.ca/gouv/politiques-orientations/vitrine-numeriqc/accompagnement-des-organismes-publics/demarche-conception-services-numeriques)

---


<div>
    <img src="https://github.com/CQEN-QDCE/.github/blob/main/images/mcn.png" />
</div>

## À propos de la bibliothèque mdoc Typescript
Cette bibliothèque met en oeuvre la spécification mdoc : [ISO/IEC 18013-5:2021](https://www.iso.org/standard/69084.html), Identification personnelle -- Permis de conduire conforme à l'ISO -- Partie 5 : Application de permis de conduire mobile (mDL).

### Fonctionalités
* **Analyse et vérification** mdocs et requêtes de mdocs, avec vérification de la validité de l'objet de sécurité mobile (Mobile Security Object, MSO), du type de document, des chaînes de certificats, du contrôle de l'altération des éléments, des signatures de l'émetteur et de l'appareil du détenteur.
* **Création et signature** de documents mdoc avec des éléments signés par l'émetteur et l'authentification (COSE Sign1) de l'émetteur (objet de sécurité mobile, MSO).
* **Présentation** de documents mdoc supportant la divulgation sélective des éléments signés par l'émetteur et l'authentification (COSE Mac0 ou COSE Sign1) du dispositif mdoc.
* **Création** de requêtes mdoc avec authentification (COSE Sign1) du lecteur
* Prise en charge de l'**intégration** avec diverses bibliothèques et cadriciels cryptographiques, afin d'effectuer les opérations cryptographiques et la gestion des clés. Support for **integration** with various crypto libraries and frameworks, to perform the cryptographic operations and key management

## Licence
Distribué sous Licence Apache 2.0. Voir [LICENCE](LICENSE) pour plus d'informations.

## Remerciements
Cette bibliothèque est un port (conversion) de la bilbiothèque [Kotlin Multiplatform mdoc library](https://github.com/walt-id/waltid-mdoc)
