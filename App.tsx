import React, {useEffect} from 'react';
import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';

const SITE_URL = 'https://bina.az';
// const SITE_URL = 'https://google.com';

const COOKIE_KEY = 'binaCookies';

function App(): Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const setCookies = async () => {
      const savedCookies = await AsyncStorage.getItem(COOKIE_KEY);

      if (!savedCookies) {
        return;
      }

      const parsedCookies = JSON.parse(savedCookies);

      for (let cookieItem of parsedCookies) {
        await CookieManager.set(SITE_URL, cookieItem);
      }
    };

    const startWatchCookiesInterval = () => {
      return setInterval(async () => {
        const cookies =
          Platform.OS === 'ios'
            ? await CookieManager.get(SITE_URL, true)
            : await CookieManager.get(SITE_URL);
        console.log(cookies);

        if (Object.keys(cookies).length === 0) {
          return;
        }

        const arrayOfCookies = Object.values(cookies).map(val => val);
        await AsyncStorage.setItem(COOKIE_KEY, JSON.stringify(arrayOfCookies));
      }, 2000);
    };

    setCookies();

    let interval: any = null;
    const timeout = setTimeout(() => {
      interval = startWatchCookiesInterval();
    }, 2000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <WebView
            style={webviewStyles}
            source={{
              uri: SITE_URL,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const webviewStyles: any = {width: '100%', height: 800};
export default App;
