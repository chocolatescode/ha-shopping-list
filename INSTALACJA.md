# Instalacja krok po kroku

Ta instrukcja prowadzi od zera do działającej listy zakupów. Zajmie ok. 15 minut.
Nie trzeba niczego programować, wystarczy kopiować i wklejać.

Potrzebne będą:

- Home Assistant w wersji **2024.11 lub nowszej**
- zainstalowany **HACS** ([instrukcja instalacji HACS](https://hacs.xyz/docs/use/))
- dodatek **File editor** (Ustawienia → Dodatki → Sklep z dodatkami → *File editor* → Zainstaluj → Uruchom).
  Możesz też użyć Samby albo Studio Code Server.

---

## Krok 1. Lista zakupów w Home Assistant

Karta korzysta ze zwykłej listy zakupów HA.

1. Wejdź w **Ustawienia → Urządzenia i usługi → Dodaj integrację**.
2. Wyszukaj **Shopping list** („Lista zakupów”) i dodaj ją.
   Jeśli już ją masz, pomiń ten punkt.
3. Wejdź w **Ustawienia → Urządzenia i usługi → zakładka Encje** i wyszukaj `todo.`.
4. Kliknij encję listy zakupów, potem ⚙ (ustawienia) i sprawdź **Identyfikator encji**.
   Musi być dokładnie taki:

   ```
   todo.lista_zakupow
   ```

   Jeśli jest inny (np. `todo.shopping_list`), zmień go na `todo.lista_zakupow` i kliknij **Aktualizuj**.

---

## Krok 2. Dodaj repozytorium do HACS

1. Otwórz **HACS** z menu bocznego.
2. Kliknij **⋮** w prawym górnym rogu i wybierz **Niestandardowe repozytoria** (*Custom repositories*).
3. W polu **Repozytorium** wpisz:

   ```
   https://github.com/chocolatescode/ha-shopping-list
   ```

4. W polu **Typ** wybierz **Dashboard** (w starszych wersjach: *Lovelace* / *Plugin*).
5. Kliknij **Dodaj** i zamknij okno.

---

## Krok 3. Zainstaluj karty z HACS

1. W HACS wyszukaj **Zakupy Lista Card**, otwórz ją i kliknij **Pobierz** (*Download*) → **Pobierz**.
2. W HACS wyszukaj **button-card** (autor: custom-cards) i też kliknij **Pobierz**.
   Ta karta jest potrzebna do przycisków „często kupowane”.
3. Gdy HACS poprosi o przeładowanie strony, kliknij **Przeładuj**.
   Jeśli nie poprosi, odśwież przeglądarkę (Ctrl+F5, na telefonie zamknij i otwórz aplikację).

---

## Krok 4. Dodaj pakiet (sensory i skrypt)

Pakiet przechowuje kategorie, flagi „pilne” i historię często kupowanych produktów.

1. Otwórz **File editor**.
2. Kliknij ikonę folderu 📁 (lewy górny róg), potem ikonę **nowego folderu** i utwórz folder o nazwie:

   ```
   packages
   ```

   Jeśli folder `packages` już istnieje, pomiń ten punkt.
3. Wejdź do folderu `packages`, kliknij ikonę **nowego pliku** i nazwij go:

   ```
   zakupy_lista.yaml
   ```

4. Otwórz w przeglądarce
   [packages/zakupy_lista.yaml](https://raw.githubusercontent.com/chocolatescode/ha-shopping-list/main/packages/zakupy_lista.yaml),
   zaznacz wszystko (Ctrl+A), skopiuj (Ctrl+C), wklej do nowego pliku w File editorze i kliknij **Zapisz** 💾.
5. W File editorze otwórz plik **`configuration.yaml`** (z głównego folderu).
6. Dopisz na samym końcu pliku:

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

   **Uwaga:** jeśli w pliku jest już linia `homeassistant:`, nie dodawaj jej drugi raz.
   Dopisz tylko linię `  packages: !include_dir_named packages` (z dwiema spacjami na początku)
   bezpośrednio pod istniejącym `homeassistant:`. Jeśli jest już tam linia `packages:`,
   to pakiety masz włączone i nic nie dopisuj.
7. Kliknij **Zapisz** 💾.

---

## Krok 5. Sprawdź konfigurację i uruchom ponownie

1. Wejdź w **Narzędzia deweloperskie → zakładka YAML**.
2. Kliknij **Sprawdź konfigurację**. Musi się pojawić zielony napis *Konfiguracja prawidłowa*.
   Jeśli pojawi się błąd, przeczytaj go: zwykle chodzi o wcięcia (spacje) w `configuration.yaml` z kroku 4.6.
3. Kliknij **Uruchom ponownie** → **Uruchom ponownie Home Assistant**.
4. Po restarcie wejdź w **Ustawienia → Urządzenia i usługi → Encje** i wyszukaj `lista_zakupow`.
   Powinny być widoczne:
   - `sensor.lista_zakupow_kategorie`
   - `sensor.lista_zakupow_czesto_kupowane`
   - `sensor.lista_zakupow_pozycje`
   - `script.lista_zakupow_ustaw_kategorie`

---

## Krok 6. Dashboard z listą zakupów

1. Wejdź w **Ustawienia → Dashboardy → Dodaj dashboard → Nowy dashboard od zera**.
2. Nazwij go np. **Zakupy**, wybierz ikonę `mdi:cart` i kliknij **Utwórz**.
3. Otwórz nowy dashboard z menu bocznego.
4. Kliknij ✏️ (**Edytuj dashboard**) w prawym górnym rogu.
5. Kliknij **⋮** → **Edytor surowej konfiguracji**.
6. Usuń całą zawartość edytora.
7. Otwórz
   [examples/dashboard.yaml](https://raw.githubusercontent.com/chocolatescode/ha-shopping-list/main/examples/dashboard.yaml),
   skopiuj całość i wklej do edytora.
8. Kliknij **Zapisz**, potem **✕** i **Gotowe**.

Gotowe! 🎉

> **Wolisz dodać samą kartę do istniejącego dashboardu?**
> Edytuj dashboard → **Dodaj kartę** → na dole **Ręczna** (*Manual*) → wklej:
>
> ```yaml
> type: custom:zakupy-lista-card
> entity: todo.lista_zakupow
> ```

---

## Jak tego używać

- **Dodawanie:** wpisz nazwę w polu na górze karty i naciśnij Enter. Kategoria dobierze się sama.
- **Kupione:** kliknij kwadracik po lewej stronie produktu.
- **Zmiana kategorii:** kliknij kolorową plakietkę z nazwą kategorii przy produkcie. W tym samym menu
  jest też *Zmień nazwę* i *Usuń*.
- **Pilne:** kliknij ikonę ⚠ po prawej. Pilne produkty są zawsze na górze.
- **Własne kategorie:** przycisk **⚙ Kategorie** w karcie.
- **Często kupowane:** przyciski nad listą pojawią się same po kilku dodanych produktach.
  Kliknięcie dodaje produkt do listy.
- Listę widać też w aplikacji HA w zakładce **Do zrobienia** (*To-do*) i można ją uzupełniać głosem przez Asystenta.

---

## Aktualizacje

Gdy pojawi się nowa wersja, HACS pokaże ją w **Ustawieniach** jako dostępną aktualizację.
Kliknij **Aktualizuj**, potem odśwież przeglądarkę.

Jeśli w nowej wersji zmienił się plik `packages/zakupy_lista.yaml` (będzie to opisane w informacjach o wydaniu),
podmień jego treść jak w kroku 4 i uruchom ponownie Home Assistant.

---

## Coś nie działa?

| Objaw | Rozwiązanie |
|---|---|
| *Custom element doesn't exist: zakupy-lista-card* | Karta nie jest zainstalowana albo przeglądarka trzyma starą wersję. Sprawdź krok 3, potem Ctrl+F5. |
| *Custom element doesn't exist: button-card* | Zainstaluj **button-card** z HACS (krok 3.2). |
| Karta mówi, że nie ma encji | Identyfikator listy musi być `todo.lista_zakupow` (krok 1.4). |
| Kategorie i „pilne” nie zapisują się | Pakiet nie działa. Sprawdź krok 4 i 5 (czy są encje `lista_zakupow_*`). |
| Brak przycisków „często kupowane” | To normalne na początku. Pojawią się po dodaniu kilku produktów. |
