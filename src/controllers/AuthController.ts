import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import jimp from "jimp";
import User from "../models/User";

class AuthController {
  async signup(req: Request, res: Response) {
    const addImage = async (buffer: any) => {
      let newName = `${uuid()}.jpg`;
      let tmpImg = await jimp.read(buffer);
      tmpImg
        .cover(150, 150)
        .quality(80)
        .write(`./public/media/${newName}`);
      return newName;
    };

    const { name, email, gender, password, confirmPassword } = req.body;

    if (!name || !Boolean(name.trim()) || name.length < 2)
      throw Error("data invalid");
    if (!email || !Boolean(email.trim())) throw Error("data invalid");
    if (!gender || !Boolean(gender.trim())) throw Error("data invalid");
    if (!password || !Boolean(password.trim()) || password.length < 8)
      throw Error("data invalid");
    if (!confirmPassword || !Boolean(confirmPassword.trim()))
      throw Error("data invalid");

    if (password != confirmPassword) throw Error("confirm password invalid");

    const existUser = await User.findOne({ email });

    if (existUser) throw Error("email already in use");

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      status: true,
      name,
      email,
      gender,
      password: hash
    });

    if (req.files && req.files.img) {
      //img e o nome do campo que vai ter o file na requisicao
      if (
        ["image/jpeg", "image/jpg", "image/png"].includes(
          (req.files.img as any).mimetype
        )
      ) {
        let url = await addImage((req.files.img as any).data);
        user.image = url;
      } else {
        throw Error("invalid file");
      }
    } else {
      user.image = "default.jpg";
    }

    const savedUser = await user.save();

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "2h"
      }
    );

    return res.status(200).json({ token });
  }

  async signin(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw Error("invalid login");

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) throw Error("invalid login");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "2h"
    });

    return res.status(200).json({ token });
  }
}

export default new AuthController(); // Exportando a instancia dessa classe, como no java new AuthController()
