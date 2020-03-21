## Eurovision Char Rnn

###### Description

This tool is used to generate partitions exportable in .midi from a model trained on all the victors of Eurovision.
![Generated Staff](readme-assets/staff1-char-rnn.png)

###### Creation of the database

- We have collected midi files from the eurovision rands 1, 2 and 3 through the web.
- Each midi format sound has been separated into 3 midi tracks (staff1 2 & 3).
- Each track of all ranks has been transformed into ABC notation to make them usable for an LSTM algorithm.
- The text file has been supplied to a CharRNN algorithm (source) and the resulting model is used to generate new midi files.

The sources of the text files are here : [training-data](https://github.com/)
An exemple of midi exported file with voice generated with GPT2 : [je-secoue-le-monde.mp3](je-secoue-le-monde.mp3)

###### Credit

- Concept : data.bingo
- Development : Bastien Didier

###### Gallery