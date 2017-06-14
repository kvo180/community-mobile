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
import axios from 'axios';
import EventListHeader from './EventListHeaderComponent';
import Drawer from './Drawer/DrawerContainer';

const baseUrl = 'http://localhost:3000';

const styles = StyleSheet.create({
  row: {
    borderColor: 'grey',
    borderWidth: 0,
    marginVertical: 10,
    marginHorizontal: 7
  },
  text: {
    alignSelf: 'center',
    color: '#000',
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
      this.props.disableButton({
        attendDisabled: !!res.data.is_attending,
        likeDisabled: !!res.data.liked
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
        <View style={styles.row}>
          <Image
            style={styles.image}
            source={{uri: this.props.data.image}}
          />
          <Text style={styles.text} >
            {this.props.data.event_name}
          </Text>
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
      loaded: 0
    };
    // this._onClick = this._onClick.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  render() {
    return (
      <View>
        <EventListHeader {...this.props}/>
        <Drawer navigation={this.props.screenProps.navigation}/>
        <ScrollView
          style={styles.scrollview}
          removeClippedSubViews={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#3EB1E0"
              title="Loading..."
              titleColor="#3A3F3F"
              colors={['#3EB1E0', '#3A3F3F', '#C4D4CC']}
              progressBackgroundColor="#C4D4CC"
            />
          }>
          {this.props.allEvents.map((row, index) => {
            return <Row key={index} data={row} index={index}
              userId={this.props.userId}
              setCurrentEvent={this.props.setCurrentEvent}
              setCurrentEventParticipants={this.props.setCurrentEventParticipants}
              disableButton={this.props.disableButton}
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
