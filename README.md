# Zakupy Lista Card

Karta Lovelace dla Home Assistant: lista zakupów z **automatycznymi kategoriami**, sortowaniem,
flagą **„pilne”** i szybkim dodawaniem **często kupowanych** produktów. Interfejs po polsku.

Działa na dowolnej encji `todo.*` (np. z integracji *Shopping list*), więc lista synchronizuje się
z aplikacją mobilną HA i asystentem głosowym.

> 📘 **Pierwszy raz?** Zobacz [instrukcję instalacji krok po kroku](INSTALACJA.md).

## Funkcje

- **Kategorie automatyczne** – produkt trafia do grupy po słowach kluczowych (Pieczywo, Nabiał, Sypkie,
  Owoce i warzywa, Chemia, Słodycze / przekąski, Napoje, Przyprawy, Mrożonki, Leki, Inne).
  Wygrywa najdłuższe dopasowanie, a słowa z prefiksem `!` mają pierwszeństwo
  (np. „sok pomarańczowy” → Napoje, nie Owoce).
- **Ręczna zmiana kategorii** pojedynczego produktu (kliknij etykietę kategorii przy produkcie) –
  zapamiętywana na przyszłość. Kategorię można też wybrać od razu przy dodawaniu (przycisk 🏷 obok pola).
- **Filtr wielu kategorii** – zaznacz dowolną liczbę chipów (np. Nabiał + Pieczywo); „Wszystkie” czyści
  wybór, a „Pilne” dodatkowo zawęża do pilnych.
- **Edytor kategorii** (⚙ Kategorie) – dodawanie, usuwanie, zmiana nazwy, ikony, koloru, słów kluczowych
  i kolejności. Zapisywane w Home Assistant, więc wspólne dla wszystkich urządzeń.
- **Pilne** – oznaczone pozycje na górze listy; flaga znika po odhaczeniu.
- **Leki / recepty** – nazwa zawierająca 11-cyfrowy PESEL i 4-cyfrowy kod recepty (albo słowa
  „recepta”, „apteka”) trafia do kategorii *Leki* i jest zawsze pilna. Takie nazwy **nie są**
  zapisywane w historii „często kupowane”.
- **Sortowanie**: kategorie / A–Z / Z–A / kolejność dodania; filtr i widoczność kupionych
  zapamiętywane lokalnie w przeglądarce.
- **Podpowiedzi** przy dodawaniu z historii często kupowanych.
- Opcjonalne **chipy „często kupowane”** (custom:button-card) – jedno kliknięcie dodaje produkt.

## Wymagania

- Home Assistant 2024.11 lub nowszy
- encja listy `todo.*` (np. integracja **Shopping list**)
- opcjonalnie [button-card](https://github.com/custom-cards/button-card) – tylko dla chipów

## Instalacja

### 1. Karta (JS)

**HACS:** HACS → ⋮ → *Custom repositories* → adres tego repozytorium, typ *Dashboard* → zainstaluj.

**Ręcznie:** skopiuj `zakupy-lista-card.js` do `/config/www/zakupy/` i dodaj zasób
(Ustawienia → Dashboardy → ⋮ → Zasoby):

```yaml
url: /local/zakupy/zakupy-lista-card.js?v=1
type: module
```

Po każdej aktualizacji pliku podbij `?v=`, żeby przeglądarka nie trzymała starej wersji.

### 2. Pakiet (sensory + skrypt)

Karta przechowuje ręczne kategorie, flagi „pilne” i definicje kategorii w atrybutach sensora
szablonowego (integracja todo nie ma pól na tagi). Skopiuj `packages/zakupy_lista.yaml`
do `/config/packages/` i włącz pakiety w `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

Pakiet tworzy:

| Encja | Rola |
|---|---|
| `sensor.lista_zakupow_kategorie` | atrybuty `tagi`, `pilne`, `kategorie` |
| `sensor.lista_zakupow_czesto_kupowane` | atrybut `czeste` – licznik dodań produktów |
| `sensor.lista_zakupow_pozycje` | bieżące nieodhaczone pozycje (dla chipów) |
| `script.lista_zakupow_ustaw_kategorie` | zapis kategorii / pilne (wywoływany przez kartę) |

Pakiet zakłada encję **`todo.lista_zakupow`**. Jeśli Twoja nazywa się inaczej
(np. `todo.shopping_list`), zmień ją w pakiecie, w przykładach i w konfiguracji karty.

Po dodaniu pakietu zrestartuj Home Assistant (nowe sensory szablonowe i skrypt).

### 3. Karta na dashboardzie

```yaml
type: custom:zakupy-lista-card
entity: todo.lista_zakupow
```

Cały gotowy dashboard: [`examples/dashboard.yaml`](examples/dashboard.yaml).
Sam widok z chipami: [`examples/widok.yaml`](examples/widok.yaml) + szablon
[`examples/button_card_templates.yaml`](examples/button_card_templates.yaml).
Wszystkie opcje karty: [`examples/karta.yaml`](examples/karta.yaml).

## Konfiguracja

| Opcja | Domyślnie | Opis |
|---|---|---|
| `entity` | – (wymagane) | encja `todo.*` |
| `sensor` | `sensor.lista_zakupow_kategorie` | magazyn tagów / pilnych / kategorii |
| `script` | `script.lista_zakupow_ustaw_kategorie` | skrypt zapisu |
| `czeste` | `sensor.lista_zakupow_czesto_kupowane` | historia do podpowiedzi |
| `kategorie` | wbudowane | lista `{id, nazwa, ikona, kolor, slowa}` |

### Słowa kluczowe

Dopasowanie bez wielkości liter i polskich znaków (`ł` → `l`, `ó` → `o` itd.).

| Zapis | Znaczenie |
|---|---|
| `chleb` | początek słowa (chleb, chleba, chlebek) |
| `por=` | całe słowo (*por*, ale nie *pomarańcza*) |
| `!sok=` | pierwszeństwo nad zwykłymi dopasowaniami |
| `papier toalet` | fraza wielowyrazowa |

## Prywatność

W repozytorium jest wyłącznie kod i przykładowa konfiguracja. Twoja lista, historia
„często kupowane” i własne kategorie są przechowywane tylko w Twojej instancji Home Assistant
(stan encji / baza recordera) i nie trafiają do tego repo.

Atrybut `czeste` trafia do historii recordera. Jeśli tego nie chcesz, wyklucz sensor:

```yaml
recorder:
  exclude:
    entities:
      - sensor.lista_zakupow_czesto_kupowane
```

## Licencja

MIT
