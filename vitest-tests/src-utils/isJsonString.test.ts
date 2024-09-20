import { describe, it, expect } from 'vitest';
import { isJsonString } from '../../src/utils/isJsonString';

const jsonStr = `{
  "result": [
    {
      "message": "Hello, Regan! Your order number is: #16",
      "phoneNumber": "425-851-9597",
      "phoneVariation": "+90 343 435 10 73",
      "status": "active",
      "name": {
        "first": "Darrick",
        "middle": "Parker",
        "last": "Weimann"
      },
      "username": "Darrick-Weimann",
      "password": "B5KeTG7HInDB_Zi",
      "emails": [
        "Heaven.Cronin@example.com",
        "Florida_Jacobson@example.com"
      ],
      "location": {
        "street": "90115 Toby Pike",
        "city": "Port Ozella",
        "state": "Oregon",
        "country": "Azerbaijan",
        "zip": "94913-9802",
        "coordinates": {
          "latitude": "76.7725",
          "longitude": "-150.7292"
        }
      },
      "website": "https://snarling-observatory.name",
      "domain": "raw-mustache.org",
      "job": {
        "title": "District Group Coordinator",
        "descriptor": "Customer",
        "area": "Quality",
        "type": "Executive",
        "company": "Schiller, Stoltenberg and VonRueden"
      },
      "creditCard": {
        "number": "3791-185396-01925",
        "cvv": "091",
        "issuer": "visa"
      },
      "uuid": "6f0eb050-fdbf-45f7-a651-464ecb4d3a56",
      "objectId": "66ec2c3a7d19c182de6d9520"
    },
    {
      "message": "Hello, Clifford! Your order number is: #71",
      "phoneNumber": "816-459-1238 x6320",
      "phoneVariation": "+90 385 952 10 61",
      "status": "disabled",
      "name": {
        "first": "Hudson",
        "middle": "Sasha",
        "last": "Oberbrunner"
      },
      "username": "Hudson-Oberbrunner",
      "password": "NOkKH4bhDGSAHou",
      "emails": [
        "Woodrow.Nicolas47@gmail.com",
        "Allan89@gmail.com"
      ],
      "location": {
        "street": "5510 W Jackson Street",
        "city": "Lake Othaburgh",
        "state": "Georgia",
        "country": "Ethiopia",
        "zip": "47558-9563",
        "coordinates": {
          "latitude": "-71.574",
          "longitude": "16.8998"
        }
      },
      "website": "https://separate-verb.com",
      "domain": "favorable-threshold.info",
      "job": {
        "title": "Corporate Infrastructure Assistant",
        "descriptor": "Investor",
        "area": "Marketing",
        "type": "Technician",
        "company": "Waelchi, Wolf and Tromp"
      },
      "creditCard": {
        "number": "3529-0944-6232-0622",
        "cvv": "807",
        "issuer": "jcb"
      },
      "uuid": "2d07114b-783e-4612-886f-503b6a08fa53",
      "objectId": "66ec2c3a7d19c182de6d9521"
    }
  ]
}`;

const incompleteJSON = `{
  "script": "node uh, um... 
}`;

const cases = [
  { describe: "Should be JSON", str: jsonStr, shouldThrow: false },
  { describe: "Should be an incomplete JSON", str: incompleteJSON, shouldThrow: true },
]

// NOTE: throwの有無をテストしたい場合、スローする関数をassertion内で別の関数でラップすること
describe('Test isJsonString()', () => {
  cases.forEach(c => {
    it(c.describe, () => {
      if (c.shouldThrow) {
        expect(() => isJsonString(c.str)).toThrow();
      }
      else {
        expect(() => isJsonString(c.str)).not.toThrow();
      }
    })
  })
})