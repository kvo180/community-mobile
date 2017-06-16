import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Image,
  TouchableWithoutFeedback,
  View,
  Dimensions } from 'react-native';
import { Card } from 'react-native-material-ui';
import axios from 'axios';
import EventListOptionsBar from './EventListOptionsBar';
import EventListHeader from './EventListHeaderComponent';
import Drawer from './Drawer/DrawerContainer';
import Spinner from 'react-native-loading-spinner-overlay';

const baseUrl = 'https://warriors-community.herokuapp.com';

const styles = StyleSheet.create({
  row: {
    borderColor: 'grey',
    borderWidth: 0,
    marginVertical: 10,
    marginHorizontal: 7
  },
  text: {
    alignSelf: 'center',
    marginTop: 5,
    color: '#31575B',
    fontSize: 14,
    fontWeight: 'bold'
  },
  scrollview: {
    height: '100%',
    width: '100%',
  },
  image: {
    width: 300,
    height: 200,
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

class Row extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onEventClick(this.props.index);
    this.props.setCurrentEvent(this.props.index);

    axios.post(baseUrl + '/api/connectEventToProfile', {
      eventId: this.props.data.id,
      userId: this.props.userId
    })
    .then(res => {
      this.props.updateButton({
        isAttendingEvent: !!res.data.is_attending,
        hasLikedEvent: !!res.data.liked
      });
    })
    .catch(err => { console.log(err); });

    axios.post(baseUrl + '/api/retrieveParticipants', {
      eventId: this.props.data.id,
      userId: this.props.userId
    })
    .then(res => { this.props.setCurrentEventParticipants(res.data); })
    .catch(err => { console.log(err); });
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.handleClick}>
        <View style={{alignItems: 'center'}}>
          <Card style={{container: {width: 330, alignItems: 'center'}}}>
            <View style={styles.row}>
              <Image
                style={styles.image}
                source={{uri: this.props.data.image}}
              />
              <Text style={styles.text} >
                {this.props.data.event_name}
              </Text>
            </View>
          </Card>
        </View>
       </TouchableWithoutFeedback>
    );
  }
}

class EventListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      loaded: 0,
      category: '',
      isLoading: true
    };
    // this._onClick = this._onClick.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 3000);
  }

  render() {
    const categories = ['food', 'sports', 'outdoors', 'nightlife', 'games', 'other'];
    const ScreenHeight = Dimensions.get("window").height;
    const ScreenWidth = Dimensions.get("window").width;

    return (
      <View style={{width: ScreenWidth, height: ScreenHeight}}>
        <Spinner visible={this.state.isLoading}/>
        <EventListHeader {...this.props}/>
        <EventListOptionsBar {...this.props} />
        <Drawer navigation={this.props.screenProps.navigation}/>
        <ScrollView
          style={styles.scrollview}
          removeClippedSubViews={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#31575B"
              title="Loading..."
              titleColor="#3A3F3F"
              colors={['#31575B', '#3A3F3F', '#C4D4CC']}
              progressBackgroundColor="#C4D4CC"
            />
          }>
          {this.props.allEvents.map((row, index) => {
            return <Row key={index} data={row} index={index}
              userId={this.props.userId}
              setCurrentEvent={this.props.setCurrentEvent}
              setCurrentEventParticipants={this.props.setCurrentEventParticipants}
              updateButton={this.props.updateButton}
              onEventClick={this.props.onEventClick}
            />;
          })}
        </ScrollView>
      </View>
    );
  }

  _onRefresh() {
    const context = this;
    this.setState({isRefreshing: true});

    axios.get(baseUrl + '/api/retrieveEvents')
      .then((res) => {
        this.props.addEvents(res.data);
      })
      .then(() => {
        setTimeout(() => {
          context.setState({
            isRefreshing: false
          });
        }, 2000);
      })
      .catch((err) => {
        console.log('Error occurred while retrieving events:', err);
      });
  };
}

export default EventListComponent;
