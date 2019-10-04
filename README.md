# Scientific output visualiser

The scientific output visualiser is a tool for graphic representation
of meta-data about research, using D3,js, jQuery, and Node.
The tool uses output from the Expertus SPLENDOR system as it's intput data.

Wizualizator dorobku naukowego to narzędzie do graficznego przedstawiania metadanych o publikacjach naukowych.
Powstało z użyciem D3.js, jQuery oraz Node.
Dane wejściowe są pobierane z serwisu Expertus SPLENDOR.

# Obsługa
## Wymagania
Aplikacja wymaga środowiska Unix z
 1. `node >=8.16.1`
 1. bazą `MongoDB`
 1. następującymi paczkami `build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Konfiguracja i uruchomienie
 1. Plik `config.json.sample` należy skopiować jako `config.json`, zastępując przykładowe wartości które zawiera.
 w szczególności skonfigurować połączenie z bazą danych poprzez `dbConnStr`
 1. W skrypcie `seed.js` zmienić pole `password` na hasło pożądane hasło administratora.
 1. Zainstalować zależności `npm` poprzez `npm install`.
 1. Uruchomić skrypt seedujący poprzez `node seed.js`.
 1. Uruchomić aplikację poprzez `node server.js`.
 
# Struktura
Właściwe wizualizacje tworzone są w przeglądarce, w elemencie `canvas`. Do wyboru wizualizacji i innych dodatkowych
funkcjonalności służy prosta aplikacja oparta o MVC.
## Modele
Dostęp do bazy danych MongoDB odbywa się poprzez ORM Mongoose.
Wszystkie modele można znaleźć w pliku `models.js`.
## Kontrolery
Folder `routes` zawiera pliki zajmujące się obsługą panelu administracyjnego, oraz wyborem wizualizacji.
### Lokalizacja (i18n)
Aplikacja dostępna jest po polsku i angielsku, odpowiedni tekst jest dodawany do szablonów w oparciu o
pole `lang` na obiekcie sesji. Tekst dla obu języków jest przechowywany w JSON w folderze `lang`.
### Panel administracyjny
Prosty panel adminsitracyjny służy do przechowywania na serwerze dużych plików do wyboru w 
wizualizacjach grupowych. Panel administracyjny jest dostępny pod ścieżką `/admin`
## Widoki
Aplikacja renderuje pliki HTML po stronie servera, używając preprocesora `pug` (kiedyś nazywany `jade`).
Szablony `pug` znajdują się w folderze `views`.


