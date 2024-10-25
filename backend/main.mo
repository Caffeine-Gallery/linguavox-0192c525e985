import Text "mo:base/Text";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

actor {
    // Define the Translation type
    type Translation = {
        sourceText: Text;
        translatedText: Text;
        targetLanguage: Text;
        timestamp: Text;
    };

    // Store translations in a stable variable
    stable var translations : [Translation] = [];
    
    // Buffer for managing translations
    let translationsBuffer = Buffer.Buffer<Translation>(0);

    // Add a new translation
    public shared func addTranslation(sourceText: Text, translatedText: Text, targetLanguage: Text) : async () {
        let timestamp = Time.now();
        let formattedTime = Int.toText(timestamp);
        
        let translation: Translation = {
            sourceText = sourceText;
            translatedText = translatedText;
            targetLanguage = targetLanguage;
            timestamp = formattedTime;
        };

        translationsBuffer.add(translation);
        
        // Keep only the last 50 translations
        if (translationsBuffer.size() > 50) {
            let temp = Buffer.Buffer<Translation>(50);
            let start = translationsBuffer.size() - 50;
            for (i in Iter.range(start, translationsBuffer.size() - 1)) {
                temp.add(translationsBuffer.get(i));
            };
            translationsBuffer.clear();
            for (item in temp.vals()) {
                translationsBuffer.add(item);
            };
        };
    };

    // Get translation history
    public query func getTranslationHistory() : async [Translation] {
        Buffer.toArray(translationsBuffer)
    };

    // System functions for upgrade persistence
    system func preupgrade() {
        translations := Buffer.toArray(translationsBuffer);
    };

    system func postupgrade() {
        for (translation in translations.vals()) {
            translationsBuffer.add(translation);
        };
    };
}
