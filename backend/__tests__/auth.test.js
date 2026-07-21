/**
 * Auth endpoint tests
 * Tests validation middleware structure and JWT token generation
 */
import {
  loginValidation,
  registerValidation,
} from "../middleware/validationMiddleware.js";
import jwt from "jsonwebtoken";

describe("Auth Validation Rules", () => {
  describe("loginValidation", () => {
    it("should have 3 middleware functions (email + password + error handler)", () => {
      expect(loginValidation.length).toBe(3);
    });
  });

  describe("registerValidation", () => {
    it("should have 4 middleware functions (name + email + password + error handler)", () => {
      expect(registerValidation.length).toBe(4);
    });
  });
});

describe("JWT Token Generation", () => {
  it("should generate a token with correct 3-part JWT structure", () => {
    const generateToken = (id, role) => {
      return jwt.sign({ id, role }, process.env.JWT_SECRET || "test-secret", {
        expiresIn: "30d",
      });
    };

    const token = generateToken("123", "Admin");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });
});
