import 'package:flutter/material.dart';
import 'package:tictactoe/responsive.dart';
import 'package:tictactoe/screens/add_room_screen.dart';
import 'package:tictactoe/screens/enter_room_screen.dart';
import 'package:tictactoe/widgets/custom_button.dart';

class MainMenuScreen extends StatelessWidget {
  static String routeName = '/main-menu';
  const MainMenuScreen({Key? key}) : super(key: key);

  void addRoom(BuildContext context, bool add) {
    add == true
        ? Navigator.pushNamed(context, AddRoomScreen.routeName)
        : Navigator.pushNamed(context, EnterRoomScreen.routeName);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Responsive(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomButton(
              onTap: () => addRoom(context, true),
              text: 'Add Room',
            ),
            const SizedBox(height: 20),
            CustomButton(
              onTap: () => addRoom(context, false),
              text: 'Enter Room',
            ),
          ],
        ),
      ),
    );
  }
}
