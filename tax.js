var Niso = { 
    AmtTax: {
        exemptions: {
            'single': 53900,
            'married-joint': 83800,
            'married-separate': 41900,
            'head-of-household': 53900
        },
        rates: {
            pcts: [.26, .28],
            cutoffs: {
                'single': [ 89750, Infinity],
                'married-joint': [ 179500, Infinity ],
                'married-separate': [ 89750, Infinity],
                'head-of-household': [ 89750, Infinity]
            }
        },

        brackets: function(filing_as) {
            return _.
                zip(this.rates.pcts, this.rates.cutoffs[filing_as]).
                map(function(elt) {
                    return {
                        pct: elt[0],
                cutoff: elt[1]
                    }
                });
        },

        calculate: function(amount, filing_as) {
            var left = amount;
            var tax = 0;

            var brackets = this.brackets(filing_as);

            _.each(brackets, function(bracket) {
                var tranch = Math.min(bracket.cutoff, left);

                left = left - tranch;

                tax += tranch * bracket.pct;
            });

            return tax;
        },
    },
    CapGainsTax: {
        rates: {
            pcts: [0.01, .15, .20],
            cutoffs: {
                'single': [ 36250, 400000, Infinity ],
                'married-joint': [ 72500, 450000, Infinity ],
                'married-separate': [ 36250, 225000, Infinity ],
                'head-of-household': [ 48600, 425000, Infinity ]
            }
        },

        brackets: function(filing_as) {
            return _.
                zip(this.rates.pcts, this.rates.cutoffs[filing_as]).
                map(function(elt) {
                    return {
                        pct: elt[0],
                cutoff: elt[1]
                    }
                });
        },

        calculate: function(amount, agi,  filing_as) {
            var left = amount;
            var tax = 0;

            var brackets = this.brackets(filing_as);

            _.each(brackets, function(bracket) {
                var tranch = Math.min(bracket.cutoff, left);

                left = left - tranch;

                tax += tranch * bracket.pct;
            });

            return tax;
        }
    },
    TenFortyTax: {
        rates: {
            pcts: [.10, .15, .25, .28, .33, .35, .396],
            cutoffs: {
                'single': [ 9225, 37450, 90750, 189300, 411500, 413200, Infinity],
                'married-joint': [ 18450, 74900, 151200, 230450, 411500, 464850, Infinity],
                'married-separate': [ 9225, 37450, 75600, 115225, 205750, 232425, Infinity],
                'head-of-household': [ 13150, 50200, 129600, 209850, 411500, 439000, Infinity]
            }
        },

        brackets: function(filing_as) {
            return _.
                zip(this.rates.pcts, this.rates.cutoffs[filing_as]).
                map(function(elt) {
                    return {
                        pct: elt[0],
                cutoff: elt[1]
                    }
                });
        },

        calculate: function(amount, filing_as) {
            var left = amount;
            var tax = 0;

            var brackets = this.brackets(filing_as);

            _.each(brackets, function(bracket) {
                var tranch = Math.min(bracket.cutoff, left);

                left = left - tranch;

                tax += tranch * bracket.pct;
            });

            return tax;
        }
    }
}


function calc() {
    var filing_as=$('#filing_as').val();
    var agi=parseInt($('#agi').val());
    var ti=parseInt($('#ti').val());
    var amti=parseInt($('#amti').val());

    var shares=parseInt($('#shares').val());
    var strike=parseInt($('#strike').val());
    var fourohnine=parseInt($('#fourohnine').val());
    var market=parseInt($('#market').val());

    var cost = shares * strike;
    var fourohnine_value = fourohnine * shares;
    var bargain = fourohnine_value - cost;
    var market_value = shares * market;

    var base_tax = Math.max(
        Niso.TenFortyTax.calculate(ti, filing_as),
        Niso.AmtTax.calculate(ti, filing_as)
    )

    var iso_basis = cost;
    var iso_ex_tax = Math.max(
        0, 
        Niso.AmtTax.calculate(amti + bargain, filing_as) - base_tax
    )
    var iso_cap_tax = Niso.CapGainsTax.calculate(market_value - iso_basis, agi, filing_as)

    var nso_basis = fourohnine_value;

    var nso_ex_tax = Math.max(
        0, 
        Math.max(
            Niso.TenFortyTax.calculate(ti + bargain, filing_as),
            Niso.AmtTax.calculate(amti + bargain, filing_as)
            ) - base_tax
    )

    var nso_cap_tax = Niso.CapGainsTax.calculate(market_value - nso_basis, agi, filing_as)


    $('#bargain').val(bargain)
    $('#value').val(market_value)
    $('#base_tax').val(market_value)
    $('#iso_basis').val(iso_basis)
    $('#iso_ex_tax').val(iso_ex_tax)
    $('#iso_cap_tax').val(iso_cap_tax)
    $('#nso_basis').val(nso_basis)
    $('#nso_ex_tax').val(nso_ex_tax)
   $('#nso_cap_tax').val(nso_cap_tax)
}
