import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentEvent, toggleEventDetails } from './../EventDetails/eventDetailsActions';
import { Button, StyleSheet, Text, TextInput, View, Image, TouchableHighlight} from 'react-native';
import EventListComponent from './EventListComponent';
// import EventDetails from './EventDetailsComponent';


class EventListContainer extends Component{
  static navigationOptions = ({ navigation, screenProps }) => {
    const onPressMap = () => {
      const { goBack } = navigation;
      goBack();
    }

    return {
      headerLeft: (<Button title="Map" onPress={onPressMap}></Button>)
    };
  }

  onEventClick = (index) => {
    this.props.setCurrentEvent(index);
    const { navigate } = this.props.navigation;
    navigate('EventDetails');
  }

  render() {
    return (
      <View>
        <EventListComponent {...this.props}
        onEventClick={this.onEventClick.bind(this)}/>
        {/* <EventDetails {...this.props}/> */}
      </View>
    );
  }
}

// const mapDispatchToProps = (dispatch) => {
//   return bindActionCreators({
//     centerLocation: centerLocation,
//     addEvents: addEvents
//   }, dispatch);
// }

// TODO: add mapDispatchToProps to export default below

const mapStateToProps = (state) => {
  const { mainReducer, mapReducer, eventDetailsReducer } = state;

  return {
    allEvents: mainReducer.allEvents,
    coords: mapReducer.coords,
    showEventDetails: eventDetailsReducer.showEventDetails,
    currentEventIndex: eventDetailsReducer.currentEventIndex
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setCurrentEvent: setCurrentEvent,
    toggleEventDetails: toggleEventDetails
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(EventListContainer);
