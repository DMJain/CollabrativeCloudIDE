const Playground = require("../models/playground.model");

class PlaygroundService {
  
    static async create(data) {
      const { user, name, image, hostPort , envPort} = data;
  
      try {
        const playground = await Playground.create({
          name,
          user,
          image,
          hostPort,
          envPort
        });
        return playground;
      } catch (err) {
        console.log("Error creating", err);
        throw new Error("Internal Server Error");
      }
    }

    static async getAll(data){
        const { user } = data;

        try{
            const playgrounds = await Playground.find({user})
            return playgrounds;
        }catch(err){
            console.log("Error getting playgrounds", err);
            throw new Error("Internal Server Error");
        }
    }

    static async getOne(data){
        const { id } = data;
        try{
            const playground = await Playground.findOne({_id: id});
            return playground;
        }catch(err){
            console.log("Error getting playground", err);
            throw new Error("Internal Server Error");
        }
    }

    static async update(data){
        const { id, name } = data;
        try{
            const playground = await Playground.findOneAndUpdate({_id: id}, {name}, {new: true});
            return playground;
        }catch(err){
            console.log("Error updating playground", err);
            throw new Error("Internal Server Error");
        }
    }

    static async updateHostPort(data){
      const { id, hostPort } = data;
      try{
          const playground = await Playground.findOneAndUpdate({_id: id}, {hostPort}, {new: true});
          return playground;
      }catch(err){
          console.log("Error updating playground", err);
          throw new Error("Internal Server Error");
      }

    }

    static async updateInviteCode(data){
        const {id, code} = data;
        try{
            const playground = await Playground.findOneAndUpdate({_id: id}, {inviteCode : code}, {new: true});
            return playground;
        }catch(err) {
            console.log("Error Updating invite code");
            throw new Error("Internal Server Error")
        }
    }
  
  }

  
  module.exports = PlaygroundService;